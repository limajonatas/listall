<template>
  <dialog-base
    :model-value="modelValue"
    title="Tags"
    @update:model-value="$emit('update:modelValue', $event)"
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

    <!-- LISTA COM INDICADOR DE SCROLL -->
    <div class="list-wrapper">
      <q-list
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
        >
          <q-item-section>
            <q-item-label>{{ tag.name }}</q-item-label>
          </q-item-section>
        </q-item>
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
import { tagService } from "src/db/dbServices";
export default defineComponent({
  name: "tags-list",
  /**
   * @prop {boolean} modelValue - controla visibilidade do dialog (v-model)
   * @prop {boolean} selectionMode - (futuro) modo de seleção de tags
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
  },
  emits: ["update:modelValue"],
  components: {
    DialogBase: defineAsyncComponent(() =>
      import("src/components/DialogBase.vue")
    ),
  },
  setup() {
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

    // re-checar após filtro mudar (DOM precisa atualizar antes)
    watch(filteredTags, () => {
      nextTick(checkScroll);
    });

    function getAllTags() {
      tagService.getAll().then((tagsResponse) => {
        tags.value = tagsResponse;
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
