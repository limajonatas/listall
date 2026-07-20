<template>
  <q-page class="q-pa-sm">
    <q-card class="q-mt-sm" style="display: inline-block">
      <q-tabs
        dense
        v-model="tab"
        class="text-teal rounded-borders"
        inline-label
        align="left"
        indicator-color="primary"
        active-color="white"
        active-bg-color="primary"
      >
        <q-tab
          :class="{ 'q-px-xs': $q.screen.lt.sm }"
          :style="
            index < tabs.length - 1 && tab != t.name
              ? 'border-right: 1px solid grey'
              : ''
          "
          :name="t.name"
          :icon="t.icon"
          :label="t.label"
          v-for="(t, index) in tabs"
          :key="t.name"
        />
      </q-tabs>
    </q-card>

    <q-tab-panels
      v-model="tab"
      animated
      class="shadow-2 rounded-borders q-mt-sm"
    >
      <q-tab-panel
        v-for="t in tabs"
        :key="t.name"
        :name="t.name"
        class="q-pa-xs"
      >
        <!--LIST FOR LARGE SCREEN -->
        <div class="flex row" v-if="allItens.length > 0 && $q.screen.gt.sm">
          <div
            v-for="item in allItens"
            :key="item.id"
            class="q-pa-xs col-xs-12 col-md-6 col-lg-4"
          >
            <card-item
              :item="item"
              :is-todo="tab == 'to-do'"
              :is-count="tab == 'count'"
              @check="checkItem"
              @increment="increment(item)"
              @decrement="decrement(item)"
              @edit="editItem(item)"
              @duplicate="duplicateItem(item)"
              @delete="deleteItem(item)"
            />
          </div>
        </div>

        <!--LIST FOR SMALL SCREEN-->
        <div v-else-if="allItens.length > 0 && !$q.screen.gt.sm">
          <div class="q-pa-xs text-center">
            Arraste para esquerda para editar e para direita para excluir
          </div>
          <q-list
            bordered
            class="rounded-borders"
            separator
            style="max-height: calc(100vh - 200px); overflow-y: scroll"
          >
            <q-slide-item
              @right="onRight($event, item)"
              @left="onLeft($event, item)"
              right-color="red"
              v-for="item in allItens"
              :key="item.id"
            >
              <template v-slot:right>
                <q-icon name="delete" />
              </template>
              <template v-slot:left>
                <q-icon name="edit" />
              </template>
              <template v-slot:default>
                <card-item
                  :item="item"
                  :is-todo="tab == 'to-do'"
                  :is-count="tab == 'count'"
                  @check="checkItem"
                  @increment="increment(item)"
                  @decrement="decrement(item)"
                  @edit="editItem(item)"
                  @duplicate="duplicateItem(item)"
                  @delete="deleteItem(item)"
                />
              </template>
            </q-slide-item>
          </q-list>
        </div>
        <div class="col-xs-12 q-pa-sm text-subtitle1 text-center" v-else>
          Nenhum item criado!
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!--DIALOG CRIAR / EDITAR ITEM-->
    <create-or-edit-item-dialog
      v-model="dialogItem"
      :editing-item="editingItem"
      v-model:title="titleNewItem"
      v-model:description="descriptionNewItem"
      v-model:count-start="countStartNewItem"
      v-model:list-type="listType"
      :tags-selected-data="tagsSelectedData"
      @submit="createOrUpdateItem"
      @openTags="openTagsSelection"
      @hide="resetEdit"
    />

    <!--BOTAO FLUTUANTE-->
    <q-page-sticky position="bottom-right" :offset="[8, 10]">
      <q-btn
        dense
        fab
        icon="add"
        color="primary"
        @click="
          dialogItem = true;
          listType = tab;
        "
      />
    </q-page-sticky>

    <tags-list
      v-model="showTagsList"
      :selectionMode="tagsListSelectionMode"
      @submitSelection="onTagsSubmitted"
    />
  </q-page>
</template>

<script lang="js">
import { computed, defineAsyncComponent, defineComponent, onMounted, ref, watch } from 'vue'
import { counterService, listService, tagService, todoService } from 'src/db/dbServices'
import { Dialog, Notify } from 'quasar';
import { useConfig } from "src/stores/config-store";
import { storeToRefs } from 'pinia';
import { randomColor } from "src/utils/utils";

export default defineComponent({
  name: 'PageName',
  setup() {

    const configStore = useConfig();
    const { confirmDeleteItem, persistLastTabCategory, lastTabCategory } = storeToRefs(configStore);

    const listType = ref('to-do')

    const titleNewItem = ref('');
    const descriptionNewItem = ref('');
    const countStartNewItem = ref(0);

    const showTagsList = ref(false)
    const dialogItem = ref(false)
    const tags = ref([])
    const tagsSelected = ref([])
    const tagsSelectedData = computed(() => {
      return tagsSelected.value.map((id) => {
        return tags.value.find((tag) => tag.id === id)
      })
    })

    const tagsListSelectionMode = ref(false);

    function openTagsSelection() {
      tagsListSelectionMode.value = true;
      showTagsList.value = true;
    }

    function onTagsSubmitted(selected) {
      tagsSelected.value = selected.map(t => t.id);
    }

    const todoList = ref([])
    const simplesList = ref([])
    const countList = ref([])

    const tab = ref(persistLastTabCategory.value ? lastTabCategory.value : 'to-do')
    const tabs = ref([
      { label: 'To-Do', name: 'to-do', icon: 'checklist' },
      { label: 'Simples', name: 'simples', icon: 'list' },
      { label: 'Contador', name: 'count', icon: 'exposure_plus_1' },
    ])


    //salva a última categoria selecionada
    watch(tab, (newTab) => {
      if (persistLastTabCategory.value) {
        lastTabCategory.value = newTab
      }
    })

    //retorna todos os itens baseado na categoria selecionada
    const allItens = computed(() => {
      if (tab.value === 'to-do') {
        return todoList.value
      } else if (tab.value === 'simples') {
        return simplesList.value
      } else if (tab.value === 'count') {
        return countList.value
      }
      return []
    })

    function createNewTagFunction() {
      if (newTagTitle.value === '' || newTagTitle.value === null || newTagTitle.value === undefined) {
        Notify.create({
          message: "Tag inválida",
          color: "negative",
          icon: "error",
          position: "top",
          timeout: 2000,
        })
        return;
      }

      const newTag = {
        name: newTagTitle.value,
        color: colorTag.value,
      }
      tagService.add(newTag).then(() => {
        getAllTags();
        createNewTag.value = false;
        newTagTitle.value = undefined;
        Notify.create({
          message: "Tag criada com sucesso",
          color: "primary",
          icon: "done",
          position: "top",
          timeout: 2000,
        });
      }).catch((error) => {
        const message = error.message;
        console.error(message);
        Notify.create({
          message: message,
          color: "negative",
          icon: "error",
          position: "top",
          timeout: 2000,
        });
      })

    }

    function getAllTags() {
      tagService.getAll().then((tagsResponse) => {
        tags.value = tagsResponse
      })
    }

    function getSimplesList() {
      listService.getAll().then((listResponse) => {
        simplesList.value = listResponse
      })
    }

    function getCountList() {
      counterService.getAll().then((countResponse) => {
        countList.value = countResponse
      })
    }

    function getTodoList() {
      todoService.getAll().then((todoResponse) => {
        todoList.value = todoResponse
      })
    }

    function getAllLists() {
      getSimplesList();
      getCountList();
      getTodoList();
    }

    function getContrastColor(hex) {
      hex = hex.replace('#', '')

      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('')
      }

      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)

      // fórmula de luminosidade relativa
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

      return luminance > 0.5 ? 'black' : 'white'
    }

    async function createOrUpdateItem() {
      if (!titleNewItem.value?.trim()) {
        Notify.create({ message: "Título inválido", color: "negative", icon: "error", position: "top", timeout: 2000 });
        return;
      }

      const newType = listType.value; // tipo selecionado no form
      const originalType = editingItem.value ? editingItemData.value.type : null;

      if (!newType) {
        Notify.create({ message: "Selecione um tipo de item", color: "negative", icon: "error", position: "top", timeout: 2000 });
        return;
      }

      // dados base do item
      let itemData = {
        title: titleNewItem.value,
        description: descriptionNewItem.value,
        tags: tagsSelected.value,
        history: [],
        type: newType
      };

      // adicionar atributos específicos por tipo
      if (newType === 'to-do') itemData.check = editingItemData.value?.check ?? false;
      if (newType === 'count') itemData.value = countStartNewItem.value ?? 0;

      // função para pegar o serviço certo
      const getService = (type) => {
        if (type === 'to-do') return todoService;
        if (type === 'simples') return listService;
        if (type === 'count') return counterService;
      };

      try {
        if (editingItem.value) {
          if (originalType === newType) {
            // mesmo tipo, atualiza normalmente
            await getService(newType).update(editingItemData.value.id, itemData);
          } else {
            // tipo diferente, remove da lista antiga e adiciona na nova
            await getService(originalType).remove(editingItemData.value.id);
            await getService(newType).add(itemData);
          }
        } else {
          // criação normal
          await getService(newType).add(itemData);
        }

        // reset de campos
        titleNewItem.value = '';
        descriptionNewItem.value = '';
        tagsSelected.value = [];
        if (newType === 'count') countStartNewItem.value = 0;
        editingItemData.value = null;
        dialogItem.value = false; // fecha o dialog

        //atualiza lista da aba atual
        getAllLists();

        Notify.create({
          message: editingItem.value ? "Item atualizado com sucesso" : "Item criado com sucesso",
          color: "primary",
          icon: "done",
          position: "top",
          timeout: 2000,
        });
        editingItem.value = false;

      } catch (error) {
        console.error(error.message);
        Notify.create({ message: error.message, color: "negative", icon: "error", position: "top", timeout: 2000 });
      }
    }


    const checkItem = ({ id, check }) => {
      todoService.updateCheck(id, check)
        .then(() => {
          Notify.create({
            message: check ? "Tarefa concluída" : "Tarefa pendente",
            color: check ? "primary" : "warning",
            icon: check ? "done" : "warning",
            position: "top",
            timeout: 2000,
          });
          getTodoList();
        })
        .catch((error) => {
          console.error(error.message);
          Notify.create({
            message: error.message,
            color: "negative",
            icon: "error",
            position: "top",
            timeout: 2000,
          });
        });
    };

    const increment = (item) => {
      counterService.incrementCounter(item.id);
      item.value++;
      item.updatedAt = new Date().toISOString(); //update date local
    }

    const decrement = (item) => {
      counterService.decrementCounter(item.id);
      item.value--;
      item.updatedAt = new Date().toISOString(); //update date local
    }

    function onRight({ reset }, item) {
      if (confirmDeleteItem.value) {
        Dialog.create({
          title: "Excluir item",
          message: `Deseja excluir o item <strong>${item.title}</strong>?`,
          cancel: true,
          html: true,
        }).onOk(() => {
          deleteItem(item);
        });
        reset();
        return;
      }

      deleteItem(item);
      reset();
    }

    /***
     * Deleta um item
     * @param {Object} item - Item a ser deletado
     */
    async function deleteItem(item) {
      try {
        if (item.type === 'to-do') {
          await todoService.remove(item.id);
          getTodoList();
        } else if (item.type === 'simples') {
          await listService.remove(item.id);
          getSimplesList();
        } else if (item.type === 'count') {
          await counterService.remove(item.id);
          getCountList();
        }
        Notify.create({
          message: "Item excluído com sucesso",
          color: "warning",
          icon: "delete",
          position: "top",
          timeout: 2000,
        });
        if (navigator && navigator.vibrate) {
          navigator.vibrate(40);
        }
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
    }

    const editingItem = ref(false);
    const editingItemData = ref();

    const editItem = (item) => {
      listType.value = tab.value; // to-do / simples / count
      titleNewItem.value = item.title;
      descriptionNewItem.value = item.description;
      tagsSelected.value = item.tags;
      if (item.value !== undefined) countStartNewItem.value = item.value;

      editingItem.value = true;
      editingItemData.value = {...item};
      dialogItem.value = true; // abre o dialog de edição
    }

    function onLeft({ reset }, item) {
      editItem(item);
      reset();
    }

    /**
     * Duplica um item
     * @param {Object} item - Item a ser duplicado
     */
    async function duplicateItem(item) {
      try {
        if (item.type === 'to-do') {
          await todoService.duplicate(item.id);
          getTodoList();
        } else if (item.type === 'simples') {
          await listService.duplicate(item.id);
          getSimplesList();
        } else if (item.type === 'count') {
          await counterService.duplicate(item.id);
          getCountList();
        }

        Notify.create({
          message: "Item duplicado com sucesso",
          color: "primary",
          icon: "done",
          position: "top",
          timeout: 2000,
        });
      } catch (error) {
        // captura o erro e notifica o usuário
        console.error(error.message);
        Notify.create({
          message: error.message,
          color: "negative",
          icon: "error",
          position: "top",
          timeout: 2000,
        });
      }
    }

    const resetEdit = () => {
      editingItem.value = false;
      editingItemData.value = undefined;
      titleNewItem.value = '';
      descriptionNewItem.value = '';
      tagsSelected.value = [];
      countStartNewItem.value = 0;
    }


    onMounted(() => {
      getAllTags();
      getAllLists();
    })

    return {
      listType,
      titleNewItem,
      descriptionNewItem,
      tags,
      tagsSelected,
      tagsSelectedData,
      getContrastColor,
      createOrUpdateItem,
      countStartNewItem,
      countList,
      simplesList,
      todoList,
      tab,
      tabs,
      allItens,
      checkItem,
      increment,
      decrement,
      onRight,
      onLeft,
      randomColor,
      editingItem,
      resetEdit,
      dialogItem,
      editItem,
      duplicateItem,
      deleteItem,
      showTagsList,
      tagsListSelectionMode,
      openTagsSelection,
      onTagsSubmitted,
    }

  },
  components: {
    CardItem: defineAsyncComponent(() => import('components/CardItem.vue')),
    CreateOrEditItemDialog: defineAsyncComponent(() => import('components/CreateOrEditItemDialog.vue')),
    TagsList: defineAsyncComponent(() => import('components/Tags/TagsList.vue')),
  }
});
</script>

<style lang="scss" scoped></style>
