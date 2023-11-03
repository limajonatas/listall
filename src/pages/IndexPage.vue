<template>
  <q-page padding class="q-gutter-y-md">
    <!-- <div class="text-center" v-if="everyCountItems.length == 0">
      <p class="text-subtitle1">
        <strong> Bem-vindo ao ListAll !</strong> <br />
        Esta é a página Inicial <br />
        comece criando um novo item para contar
      </p>
    </div> -->

    <q-card>
      <q-form :submit="createNewItem" class="q-pa-sm">
        Novo Item
        <div style="display: flex; flex-direction: row; gap: 8px">
          <div class="full-width">
            <q-input
              class="full-width"
              filled
              dense
              v-model="titleNewItem"
              label="Título"
              lazy-rules
              :rules="[(val) => val.length <= 30 || 'Máximo de 30 caracteres']"
              maxlength="30"
            />
            <q-input
              class="full-width"
              filled
              dense
              v-model="descriptionNewItem"
              label="Descrição"
            />
          </div>
          <div class="column justify-between items-center">
            <!-- TAG -->
            <q-icon
              :name="listForNewItem?.tagColor ? 'bookmark' : 'bookmark_border'"
              size="lg"
              :style="`color: ${
                listForNewItem ? listForNewItem.tagColor : '#00000'
              }`"
              @click="dialog = true"
            />
            <!--CREATE NEW ITEM-->
            <q-btn type="submit" color="primary" icon="add" />
          </div>
        </div>
      </q-form>
    </q-card>

    <!-- LISTA DE ITENS -->
    <div v-if="everyCountItems.length > 0">
      Para excluir um item, arraste-o para a direita
    </div>
    <q-list
      bordered
      class="rounded-borders"
      separator
      v-if="everyCountItems.length > 0"
    >
      <q-slide-item
        @right="onRight($event, item)"
        right-color="red"
        v-for="item in everyCountItems"
        :key="item.id"
      >
        <template v-slot:right>
          <q-icon name="delete" />
        </template>
        <template v-slot:default>
          <q-card class="q-pl-lg q-py-sm q-pr-sm">
            <q-icon
              name="bookmark"
              class="absolute-top-left"
              :style="`color: ${item.tagColor}`"
              size="sm"
            />
            <div class="item-in-list">
              <div class="full-width">
                <div class="text-bold text-subtitle1 text-uppercase">
                  {{ item.title }}
                </div>
                <div v-show="item.description" class="text-caption">
                  {{ item.description }}
                </div>
              </div>
              <div class="text-h3 q-px-sm row items-center justify-center">
                {{ item.count }}
              </div>
              <div class="column q-gutter-y-sm">
                <q-btn
                  icon="keyboard_arrow_up"
                  color="secondary"
                  @mousedown="increment(item)"
                />
                <q-btn
                  icon="keyboard_arrow_down"
                  color="grey"
                  :disable="item.count == 0"
                  @mousedown="decrement(item)"
                />
              </div>
            </div>
          </q-card>
        </template>
      </q-slide-item>
    </q-list>

    <q-dialog v-model="dialog">
      <q-card class="full-width">
        <q-card-section>
          <!--NOVA LISTA-->
          <div v-if="countItemsLists.length == 0">
            Crie sua primeira lista
            <q-form class="q-gutter-y-sm">
              <q-input label="Nome" v-model="nameNewList" outlined clearable />
              <q-input
                filled
                v-model="color"
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
                      <q-color v-model="color" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-card-actions align="right">
                <q-btn
                  label="Cancelar"
                  color="negative"
                  flat
                  @click="dialog = false"
                />
                <q-btn
                  type="submit"
                  color="primary"
                  label="Criar Lista"
                  icon="add"
                  @click="createList()"
                />
              </q-card-actions>
            </q-form>
          </div>

          <!-- LISTA DE LISTAS-->
          <div v-else class="q-gutter-y-md">
            <q-select
              outlined
              label="Listas"
              clearable
              v-model="listForNewItem"
              :options="countItemsLists"
              :option-label="
                (list) => `${list.id} - ${list.nameList} - ${list.tagColor} `
              "
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    <q-item-label class="text-grey">
                      Nenhuma lista encontrada
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:option="props">
                <q-item v-bind="props.itemProps">
                  <q-item-section avatar>
                    <q-icon
                      name="bookmark"
                      :style="`color: ${props.opt.tagColor}`"
                    />
                  </q-item-section>
                  <q-item-section>{{ props.opt.nameList }}</q-item-section>
                </q-item>
              </template>
            </q-select>

            <div>
              <q-form v-if="isNewList" class="q-gutter-y-sm">
                <hr />
                Nova Lista
                <q-input label="Nome" v-model="nameNewList" outlined> </q-input>
                <q-input
                  filled
                  v-model="color"
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
                        <q-color v-model="color" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-btn
                  type="submit"
                  color="primary"
                  icon="add"
                  label="Criar Lista"
                  @click="
                    () => {
                      isNewList = false;
                      createList();
                    }
                  "
                />
              </q-form>
              <q-card-actions align="right" v-if="!isNewList">
                <q-btn
                  label="Nova Lista"
                  flat
                  icon="add"
                  color="secondary"
                  @click="isNewList = true"
                />
                <q-btn
                  v-if="listForNewItem"
                  label="Confirmar"
                  color="primary"
                  @click="dialog = false"
                />
              </q-card-actions>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogCreateNameList">
      <q-card>
        <q-card-section class="q-gutter-y-sm">
          Vamos criar sua primeira lista de items. <br />
          Não quer dá um nome e uma cor para essa nova lista?
          <q-input label="Nome" v-model="nameNewList" outlined clearable />
          <q-input
            filled
            v-model="color"
            class="my-input"
            lazy-rules
            label="Cor"
          >
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-color v-model="color" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Não"
            color="primary"
            flat
            @click="continueCreateNewItem()"
          />
          <q-btn
            label="Criar"
            color="primary"
            flat
            @click="continueCreateNewItem()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed } from "vue";
import { Notify } from "quasar";
import { useCountItemsStore } from "src/stores/items-count-store";
import { storeToRefs } from "pinia";
import { randomColor } from "src/utils/utils";

export default defineComponent({
  name: "IndexPage",
  setup() {
    const itemsStore = useCountItemsStore();
    const titleNewItem = ref("");
    const descriptionNewItem = ref("");
    const nameNewList = ref("");
    const color = ref("#1976d2");
    const dialog = ref(false);
    const dialogCreateNameList = ref(false);
    const isNewList = ref(false);
    const { everyCountItems, countItemsLists } = storeToRefs(itemsStore);
    const listForNewItem = ref(
      countItemsLists.value.length > 0
        ? countItemsLists.value[countItemsLists.value.length - 1]
        : null
    );

    watch(
      () => dialog.value,
      () => {
        if (!dialog.value) {
          isNewList.value = false;
        }
      }
    );

    const createNewItem = () => {
      if (!titleNewItem.value) {
        Notify.create({
          message: "Título é obrigatório",
          color: "negative",
          icon: "error",
          position: "top",
          timeout: 2000,
        });
        return;
      }

      if (countItemsLists.value.length == 0) {
        dialogCreateNameList.value = true;
        return;
      }
      if (!listForNewItem.value) {
        Notify.create({
          message: "Selecione uma lista!",
          color: "negative",
          icon: "error",
          position: "top",
          timeout: 2000,
        });
        dialog.value = true;
        return;
      }

      continueCreateNewItem();
    };

    function continueCreateNewItem() {
      dialogCreateNameList.value = false;
      itemsStore.createNewItem(
        titleNewItem.value,
        descriptionNewItem.value,
        listForNewItem.value ? listForNewItem.value?.tagColor : color.value
      );

      Notify.create({
        message: "Item criado com sucesso",
        color: "positive",
        icon: "check_circle",
        position: "top",
        timeout: 2000,
      });
      titleNewItem.value = "";
      descriptionNewItem.value = "";
      listForNewItem.value =
        countItemsLists.value[countItemsLists.value.length - 1];
    }
    function increment(item) {
      itemsStore.incrementCount(item.id, item.idList);
    }

    function decrement(item) {
      itemsStore.decrementCount(item.id, item.idList);
    }

    function onRight({ reset }, item) {
      const itemDeleted = itemsStore.deleteItem(item.id, item.idList);
      Notify.create({
        message: `O item ${itemDeleted.title} foi excluído com sucesso`,
        color: "warning",
        icon: "delete",
        position: "top",
        timeout: 2000,
      });
      // finalize(reset);
    }

    function createList() {
      //para saber se o código é um hexadecimal válido verifica se o código possui 6 caracteres e tem # no inicio
      if (color.value.length == 7 && color.value[0] == "#") {
        const success = itemsStore.createNewList(
          nameNewList.value,
          color.value
        );
        if (!success) {
          isNewList.value = true;
          return;
        }
        // dialog.value = false;
        nameNewList.value = "";
        color.value = randomColor();
        listForNewItem.value =
          countItemsLists.value[countItemsLists.value.length - 1];
        return;
      }
      Notify.create({
        message: "Cor inválida",
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 2000,
      });
    }

    // Carregar os itens ao iniciar o componente
    onMounted(() => {
      // if (itemsStore.everyCountItems.length === 0) {
      //   itemsStore.everyCountItems = JSON.parse(localStorage.getItem("everyCountItems")) || [];
      // }
      itemsStore.initEveryCountItems();
    });

    return {
      titleNewItem,
      descriptionNewItem,
      everyCountItems,
      createNewItem,
      onRight,
      increment,
      decrement,
      countItemsLists,
      listForNewItem,
      dialog,
      nameNewList,
      color,
      itemsStore,
      createList,
      isNewList,
      dialogCreateNameList,
      continueCreateNewItem,
    };
  },
});
</script>
<style lang="scss" scoped>
.item-in-list {
  display: grid;
  grid-template-columns: 1fr 0.6fr 0.4fr;
  gap: 8px;
  &__description {
    word-break: break-word;
  }
  & .text-caption {
    word-break: break-word;
    line-height: 14px;
  }
  & .text-subtitle1 {
    word-break: break-word;
    line-height: 16px;
  }
}
</style>
