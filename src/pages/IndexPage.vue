<template>
  <q-page padding class="q-gutter-y-sm">
    <div class="text-center" v-if="items.length == 0">
      <p class="text-subtitle1">
        <strong> Bem-vindo ao CountAll !</strong> <br />
        Esta é a página Inicial <br />
        comece criando um novo item para contar
      </p>
    </div>
    <q-card>
      <q-form
        :submit="createNewItem"
        class="q-pa-sm row no-wrap items-start q-gutter-x-md"
      >
        <q-icon name="bookmark" size="md" />
        <div class="full-width">
          <q-input
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
        <q-btn type="submit" color="primary" icon="check_circle" />
      </q-form>
    </q-card>
    <q-list bordered class="rounded-borders" separator v-if="items.length > 0">
      <q-slide-item
        @right="onRight($event, item.id)"
        right-color="red"
        v-for="item in items"
        :key="item.id"
        style="border-radius: 0px"
      >
        <template v-slot:right>
          <q-icon name="delete" />
        </template>
        <q-card class="q-pa-sm">
          {{ item.title }}
        </q-card>
      </q-slide-item>
    </q-list>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { Notify } from "quasar";
import { useItemsStore } from "src/stores/items-store";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "IndexPage",
  setup() {
    const itemsStore = useItemsStore();
    const titleNewItem = ref('');
    const descriptionNewItem = ref('');
    const { items } = storeToRefs(itemsStore);
    const createNewItem = () => {
      if (!titleNewItem.value) {
        Notify.create({
          message: 'Título é obrigatório',
          color: 'negative',
          icon: 'error',
          position: 'top',
          timeout: 2000,
        });
        return;
      }

      itemsStore.createNewItem(titleNewItem.value, descriptionNewItem.value);

      Notify.create({
        message: 'Item criado com sucesso',
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
        timeout: 2000,
      });
      titleNewItem.value = '';
      descriptionNewItem.value = '';
    };

    function onRight({reset}, id){
      itemsStore.deleteItem(id);
      Notify.create({
        message: `Item apagado com sucesso`,
        color: 'warning',
        icon: 'delete',
        position: 'top',
        timeout: 10000,
      })
      finalize(reset);
    }

    // Carregar os itens ao iniciar o componente
    onMounted(() => {
      if (itemsStore.items.length === 0) {
        itemsStore.items = JSON.parse(localStorage.getItem('items')) || [];
      }
    });

    return {
      titleNewItem,
      descriptionNewItem,
      items,
      createNewItem,
      onRight,
    };
  },
});
</script>
