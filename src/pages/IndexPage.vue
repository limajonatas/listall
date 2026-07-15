<template>
  <q-page class="q-pa-sm">
    <q-card class="q-mt-sm">
      <div class="q-pa-xs">
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
            :name="t.name"
            :icon="t.icon"
            :label="t.label"
            v-for="t in tabs"
            :key="t.name"
          />
        </q-tabs>
      </div>
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
              @increment="increment"
              @decrement="decrement"
              @edit="editItem"
              @duplicate="duplicateItem"
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
                  @increment="increment"
                  @decrement="decrement"
                  @edit="editItem"
                  @duplicate="duplicateItem"
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
      :title="titleNewItem"
      :description="descriptionNewItem"
      :count-start="countStartNewItem"
      :list-type="listType"
      :tags-selected-data="tagsSelectedData"
      @submit="createOrUpdateItem"
      @openTags="
        dialogTags = true;
        createNewTag = false;
        newTagTitle = undefined;
      "
      @hide="resetEdit"
    />

    <!--BOTAO FLUTUANTE-->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="dialogItem = true" />
    </q-page-sticky>

    <!--list TAGS-->
    <q-dialog v-model="dialogTags" @hide="createNewTag = false">
      <q-card>
        <q-card-section style="min-width: 300px">
          <div
            class="text-primary text-subtitle1 text-bold full-width flex row justify-between"
          >
            <span v-text="'TAGs'" class="q-mr-xl" />
            <q-btn class="q-pa-none" icon="close" flat dense v-close-popup />
          </div>
          <div class="flex column">
            <span v-if="tags.length <= 0" v-text="'Sem TAGs'" />

            <q-btn
              v-if="!createNewTag"
              class="q-mt-xs"
              color="primary"
              label="Criar Tag"
              @click="
                createNewTag = true;
                colorTag = randomColor();
              "
            />

            <!--CREATE NEW TAG-->
            <q-slide-transition>
              <q-form
                class="shadow-2 q-pa-md column"
                v-show="createNewTag"
                @submit="createNewTagFunction"
              >
                <q-input
                  class="full-width"
                  filled
                  dense
                  v-model="newTagTitle"
                  label="Nova Tag"
                  lazy-rules
                  :rules="[
                    (val) => val.length <= 20 || 'Máximo de 20 caracteres',
                  ]"
                  maxlength="20"
                />
                <div class="flex row no-wrap items-center">
                  <q-icon
                    :style="`color: ${colorTag}`"
                    name="tag"
                    size="lg"
                    class="q-mb-lg"
                  />
                  <q-input
                    label="Cor"
                    dense
                    filled
                    v-model="colorTag"
                    class="my-input"
                    lazy-rules
                    :rules="[(val) => !!val || 'Cor é obrigatória']"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-color v-model="colorTag" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <q-btn
                  class="q-mt-xs"
                  color="primary"
                  label="Criar"
                  type="submit"
                />
              </q-form>
            </q-slide-transition>

            <!--LIST TAGS-->
            <q-list
              style="max-height: 300px; overflow-y: scroll"
              bordered
              class="rounded-borders q-mt-md"
              separator
              v-if="tags.length > 0"
              dense
            >
              <q-item
                clickable
                v-ripple
                v-for="tag in tags"
                :key="tag.id"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="tag" :style="`color: ${tag.color}`" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ tag.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox v-model="tagsSelected" :val="tag.id" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="js">
import { computed, defineAsyncComponent, defineComponent, onMounted, ref } from 'vue'
import { counterService, listService, tagService, todoService } from 'src/db/dbServices'
import { Dialog, Notify } from 'quasar';
import { useConfig } from "src/stores/config-store";
import { storeToRefs } from 'pinia';
import { randomColor } from "src/utils/utils";

export default defineComponent({
  name: 'PageName',
  setup() {

    const configStore = useConfig();
    const { confirmDeleteItem } = storeToRefs(configStore);

    const listType = ref('to-do')

    const titleNewItem = ref('');
    const descriptionNewItem = ref('');
    const countStartNewItem = ref(0);

    const dialogTags = ref(false)
    const dialogItem = ref(false)
    const tags = ref([])
    const tagsSelected = ref([])
    const tagsSelectedData = computed(() => {
      return tagsSelected.value.map((id) => {
        return tags.value.find((tag) => tag.id === id)
      })
    })
    const newTagTitle = ref();
    const colorTag = ref(randomColor());
    const createNewTag = ref(false);

    const todoList = ref([])
    const simplesList = ref([])
    const countList = ref([])

    const tab = ref('to-do')
    const tabs = ref([
      { label: 'To-Do', name: 'to-do', icon: 'checklist' },
      { label: 'Simples', name: 'simples', icon: 'list' },
      { label: 'Contagem', name: 'count', icon: 'exposure_plus_1' },
    ])


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
        editingItem.value = false;
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
    }

    const decrement = (item) => {
      counterService.decrementCounter(item.id);
      item.value--;
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

    function deleteItem(item) {
      if (tab.value === 'to-do') {
        todoService.remove(item.id).then(() => {
          Notify.create({
            message: "Tarefa excluída com sucesso",
            color: "primary",
            icon: "delete",
            position: "top",
            timeout: 2000,
          });
          getTodoList();
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
      } else if (tab.value === 'simples') {
        listService.remove(item.id).then(() => {
          Notify.create({
            message: "Item excluído com sucesso",
            color: "primary",
            icon: "delete",
            position: "top",
            timeout: 2000,
          });
          getSimplesList();
        }).catch((error) => {
          const message = error.message;
          console.error(message);
          Notify.create({
            message: message,
            color: "primary",
            icon: "error",
            position: "top",
            timeout: 2000,
          });
        })
      } else if (tab.value === 'count') {
        counterService.remove(item.id).then(() => {
          Notify.create({
            message: "Item excluído com sucesso",
            color: "warning",
            icon: "delete",
            position: "top",
            timeout: 2000,
          });
          getCountList();
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
      if (navigator && navigator.vibrate) {
        navigator.vibrate(40);
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

    function duplicateItem(item) {
      if (item.type === 'to-do') {
        todoService.duplicate(item.id).then(() => {
          Notify.create({
            message: "Tarefa duplicada com sucesso",
            color: "primary",
            icon: "done",
            position: "top",
            timeout: 2000,
          });
          getTodoList();
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


      }else if (item.type === 'simples') {
        listService.duplicate(item.id).then(() => {
          Notify.create({
            message: "Item duplicado com sucesso",
            color: "primary",
            icon: "done",
            position: "top",
            timeout: 2000,
          });
          getSimplesList();
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
      } else if (item.type === 'count') {
        counterService.duplicate(item.id).then(() => {
          Notify.create({
            message: "Item duplicado com sucesso",
            color: "primary",
            icon: "done",
            position: "top",
            timeout: 2000,
          });
          getCountList();
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
      dialogTags,
      tags,
      newTagTitle,
      colorTag,
      createNewTag,
      createNewTagFunction,
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
    }

  },
  components: {
    CardItem: defineAsyncComponent(() => import('components/CardItem.vue')),
    CreateOrEditItemDialog: defineAsyncComponent(() => import('components/CreateOrEditItemDialog.vue')),
  }
});
</script>

<style lang="scss" scoped></style>
