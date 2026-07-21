<template>
  <dialog-base
    @update:model-value="$emit('update:modelValue', $event)"
    @hide="resetSelection"
    @show="getAllTags"
    @cancelButton="cancelButtonPressed"
    @okButton="okButtonPressed"
    :model-value="modelValue"
    :cancel-button-label="cancelButtonLabelComputed"
    :v-close-popup-cancel-button="false"
    :ok-button-label="okButtonLabelComputed"
    :v-close-popup-ok-button="selectionActiveComputed && selectionMode"
    :ok-button-color="!selectionMode ? 'negative' : 'primary'"
    :disable-ok-button="tags.filter((t) => t.selected).length === 0"
    title="Tags"
  >
    <!-- PESQUISA -->
    <q-input
      v-model="search"
      dense
      filled
      clearable
      placeholder="Pesquisar tag..."
      class="q-mb-sm"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <!-- HEADER DA LISTA / SELEÇÃO -->
    <q-item
      class="row flex justify-between items-center q-pa-none"
      :class="{ 'q-pr-lg': selectionActiveComputed }"
      dense
    >
      <!-- INFO -->
      <div v-if="selectionActiveComputed" class="text-caption text-grey">
        {{ tags.filter((t) => t.selected).length }} tag(s) selecionada(s)
      </div>
      <!-- CRIAR TAG -->
      <div v-else>
        <q-btn
          flat
          dense
          color="primary"
          icon="add"
          label="Nova Tag"
          @click="openCreateDialog"
        />
      </div>
      <!-- CHECKBOX SELECIONAR TODAS - se estiver em modo de seleção -->
      <q-checkbox
        v-if="selectionActiveComputed && tags.length > 0"
        dense
        v-model="selectAll"
        label="Todas"
        left-label
        class="q-pr-xs"
      />
      <!-- BOTÃO MÚLTIPLA SELEÇÃO - se não estiver em modo de seleção -->
      <q-btn
        v-else-if="!selectionMode && tags.length > 0"
        flat
        color="primary"
        dense
        label="Múltipla Seleção"
        icon="checklist"
        @click="selectionActive = true"
      />
    </q-item>

    <!-- LISTA COM INDICADOR DE SCROLL -->
    <div class="list-wrapper">
      <!-- MODO SELEÇÃO: CHIPS LADO A LADO - modo de seleção -->
      <div
        v-if="selectionActiveComputed"
        class="row q-gutter-sm q-pa-sm tags-list items-start content-start"
        ref="listRef"
        @scroll="onScroll"
      >
        <q-chip
          v-for="tag in filteredTags"
          :key="tag.id"
          clickable
          :outline="!tag.selected"
          @click="tag.selected = !tag.selected"
          :style="{
            backgroundColor: tag.selected ? tag.color : 'transparent',
            borderColor: tag.color,
            color: tag.selected ? getContrastColor(tag.color) : tag.color,
            borderWidth: '2px',
            borderStyle: 'solid',
          }"
        >
          # {{ tag.name }}
        </q-chip>
        <div
          v-if="filteredTags.length === 0"
          class="text-grey full-width text-center q-pa-md"
        >
          {{ search ? "Nenhuma tag encontrada" : "Sem TAGs criadas" }}
        </div>
      </div>

      <!-- MODO NORMAL: LISTA (editar/deletar) -->
      <q-list
        v-else
        separator
        dense
        bordered
        class="rounded-borders tags-list"
        ref="listRef"
        @scroll="onScroll"
      >
        <q-item
          v-for="tag in filteredTags"
          :key="tag.id"
          :style="styleTag(tag.color)"
          :clickable="selectionActiveComputed"
          @click="
            selectionActiveComputed ? (tag.selected = !tag.selected) : null
          "
        >
          <q-item-section>
            <q-item-label>{{ tag.name }}</q-item-label>
          </q-item-section>
          <!--AÇÕES - EDITAR/DELETAR -->
          <q-item-section side>
            <div class="row flex q-gutter-x-xs">
              <q-btn
                dense
                icon="edit"
                flat
                round
                color="warning"
                @click="openEditDialog(tag)"
              />
              <q-btn
                dense
                icon="delete"
                flat
                round
                color="red"
                @click="deleteSingleTag(tag)"
              />
            </div>
          </q-item-section>
        </q-item>
        <!--SEM TAGS-->
        <q-item v-if="filteredTags.length === 0">
          <q-item-section>
            <q-item-label class="text-grey">
              {{ search ? "Nenhuma tag encontrada" : "Sem TAGs criadas" }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- INDICADOR DE MAIS ITENS ABAIXO -->
      <transition name="fade">
        <div class="scroll-indicator" v-if="hasMoreBelow">
          <q-icon name="expand_more" size="sm" class="bounce" />
        </div>
      </transition>
    </div>

    <create-or-edit-tag-dialog
      v-model="showCreateDialog"
      :tag-to-edit="tagToEdit"
      @saved="handleTagSaved"
    />
  </dialog-base>
</template>

<script>
import {
  defineAsyncComponent,
  defineComponent,
  onMounted,
  ref,
  computed,
  watch,
  nextTick,
} from "vue";
import { Dialog, Notify } from "quasar";
import { tagService } from "src/db/dbServices";
import { getContrastColor } from "src/utils/utils";
export default defineComponent({
  name: "tags-list",
  /**
   * @prop {boolean} modelValue - controla visibilidade do dialog (v-model)
   * @prop {boolean} selectionMode - (futuro) modo de seleção de tags
   * @prop {string} actionButtonTitle - título do botão de seleção
   */
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    selectionMode: {
      type: Boolean,
      default: false,
    },
    actionButtonTitle: {
      type: String,
      default: "Selecionar",
    },
    // Array com IDs das tags previamente selecionadas (usado no form de edição de Card)
    initialSelected: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "submitSelection", "tagsUpdated"],
  // tagsUpdated: evento local que o pai de escopo pode ouvir (útil caso TagsList fosse componente base)
  components: {
    DialogBase: defineAsyncComponent(() =>
      import("src/components/DialogBase.vue")
    ),
    CreateOrEditTagDialog: defineAsyncComponent(() =>
      import("src/components/Tags/CreateOrEditTagDialog.vue")
    ),
  },
  setup(props, { emit }) {
    const tags = ref([]); // todas as tags do banco
    const search = ref(""); // texto digitado no campo de pesquisa
    const listRef = ref(null); // ref ao elemento da q-list (para ler scrollTop etc)
    const hasMoreBelow = ref(false); // controla visibilidade do indicador de scroll

    // tags filtradas pelo campo de pesquisa
    const filteredTags = computed(() => {
      if (!search.value) return tags.value;
      return tags.value.filter((tag) =>
        tag.name.toLowerCase().includes(search.value.toLowerCase())
      );
    });

    /**
     * Verifica se ainda há conteúdo abaixo do scroll atual.
     * Usa uma margem de 4px para evitar falso-positivo no final da lista.
     */
    function checkScroll() {
      const el = listRef.value?.$el ?? listRef.value;
      if (!el) return;
      hasMoreBelow.value = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
    }

    // chamado pelo evento @scroll da q-list
    function onScroll() {
      checkScroll();
    }

    const selectionActive = ref(false);
    const selectionActiveComputed = computed(() => {
      return props.selectionMode || selectionActive.value;
    });

    // re-checar após filtro mudar (DOM precisa atualizar antes)
    watch([filteredTags, selectionActiveComputed], () => {
      nextTick(checkScroll);
    });

    // Reflete no visual caso o parent preencha itens (Ex: clicou num item salvo e o popup leu seus itens marcados pela IndexPage).
    watch(
      () => props.initialSelected,
      (newVal) => {
        tags.value.forEach((t) => {
          t.selected = newVal.includes(t.id);
        });
      },
      { immediate: true }
    );

    function getAllTags() {
      tagService.getAll().then((tagsResponse) => {
        tags.value = tagsResponse.map((t) => ({
          ...t,
          selected: props.initialSelected.includes(t.id),
        }));
        // checar após renderizar
        setTimeout(checkScroll, 100);
      });
    }

    /**
     * Gera o estilo inline de cada item da lista.
     * A borda esquerda grossa funciona como indicador visual da cor da tag.
     */
    function styleTag(color) {
      return {
        borderLeft: `15px solid ${color}`,
        borderRight: `2px solid ${color}`,
        borderTop: `2px solid ${color}`,
        borderBottom: `2px solid ${color}`,
        borderRadius: "5px",
        overflow: "hidden",
        marginBottom: "2px",
      };
    }

    /**
     * Getter/Setter para o checkbox "Selecionar Todas".
     * Relativamente aos itens atualmente visíveis (filtrados).
     */
    const selectAll = computed({
      get() {
        return (
          filteredTags.value.length > 0 &&
          filteredTags.value.every((t) => t.selected)
        );
      },
      set(val) {
        filteredTags.value.forEach((t) => {
          t.selected = val;
        });
      },
    });

    /**
     * Exclui as tags selecionadas com confirmação.
     */
    function deleteMultiple() {
      const selectedTags = tags.value.filter((t) => t.selected);
      if (selectedTags.length === 0) return;

      Dialog.create({
        title: "Excluir Tags",
        message: `Deseja realmente excluir ${selectedTags.length} tag(s)?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          for (const tag of selectedTags) {
            await tagService.remove(tag.id);
          }
          Notify.create({
            message: "Tags excluídas com sucesso",
            color: "warning",
            icon: "delete",
            position: "top",
            timeout: 2000,
          });
          selectionActive.value = false;
          emit("tagsUpdated");
          // Notifica aplicações soltas pela árvore para recarregarem referências órfãs e tags
          window.dispatchEvent(new CustomEvent("tags-updated"));
          getAllTags();
        } catch (error) {
          console.error(error.message);
          Notify.create({
            message: error.message,
            color: "negative",
            icon: "error",
            position: "top",
            timeout: 2000,
          });
        }
      });
    }

    /**
     * Exclui uma tag individual.
     */
    function deleteSingleTag(tag) {
      Dialog.create({
        title: "Excluir Tag",
        message: `Deseja realmente excluir a tag "${tag.name}"?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await tagService.remove(tag.id);
          Notify.create({
            message: "Tag removida",
            color: "warning",
            position: "top",
            timeout: 1500,
          });
          emit("tagsUpdated");
          // Dispara também evento global
          window.dispatchEvent(new CustomEvent("tags-updated"));
          getAllTags();
        } catch (error) {
          Notify.create({
            message: error.message,
            color: "negative",
            position: "top",
            timeout: 2000,
          });
        }
      });
    }

    const showCreateDialog = ref(false);
    const tagToEdit = ref(null);

    function openCreateDialog() {
      tagToEdit.value = null;
      showCreateDialog.value = true;
    }

    function openEditDialog(tag) {
      tagToEdit.value = tag;
      showCreateDialog.value = true;
    }

    function resetSelection() {
      selectionActive.value = false;
      tags.value.forEach((t) => (t.selected = false));
      search.value = "";
    }

    // Lida com o fechamento do diálogo de criar/editar tag e reporta aos pais
    function handleTagSaved() {
      getAllTags();
      emit("tagsUpdated");
      // Importante para recarregar as listas em IndexPage
      window.dispatchEvent(new CustomEvent("tags-updated"));
    }

    function okButtonPressed() {
      if (!props.selectionMode) {
        tags.value.forEach((t) => (t.selected = false));
      } else {
        emit(
          "submitSelection",
          tags.value.filter((t) => t.selected)
        );
      }
      selectionActive.value = false;
    }

    function cancelButtonPressed() {
      selectionActive.value = false;
      tags.value.forEach((t) => (t.selected = false));
    }

    const okButtonLabelComputed = computed(() => {
      if (!selectionActiveComputed.value) {
        return undefined;
      }
      if (!props.selectionMode) {
        return "Excluir";
      }
      return props.actionButtonTitle;
    });

    const cancelButtonLabelComputed = computed(() => {
      if (!selectionActiveComputed.value) {
        return undefined;
      }
      if (!props.selectionMode) {
        return "Cancelar";
      }
      return props.cancelButtonTitle;
    });

    onMounted(() => {
      getAllTags();
    });

    return {
      tags,
      filteredTags,
      styleTag,
      search,
      listRef,
      hasMoreBelow,
      onScroll,
      selectionActive,
      selectionActiveComputed,
      selectAll,
      deleteMultiple,
      deleteSingleTag,
      getContrastColor,
      showCreateDialog,
      tagToEdit,
      openCreateDialog,
      openEditDialog,
      getAllTags,
      resetSelection,
      handleTagSaved,
      okButtonPressed,
      cancelButtonPressed,
      okButtonLabelComputed,
      cancelButtonLabelComputed,
    };
  },
});
</script>

<style lang="scss" scoped>
.list-wrapper {
  position: relative;
}

.tags-list {
  max-height: calc(60vh - 200px);
  overflow-y: auto;
  // scroll suave
  scroll-behavior: smooth;
  // scrollbar discreta mas visível
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }
}

/**
 * Indicador de scroll - aparece quando tem mais itens abaixo
 */
.scroll-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 2px 0;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.85));
  pointer-events: none;
  color: rgba(0, 0, 0, 0.45);
}

.bounce {
  animation: bounce 1.2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
