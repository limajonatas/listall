<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <img
          src="src\assets\checklist.png"
          alt="Quasar Logo"
          style="height: 30px"
        />

        <q-toolbar-title> ListAll </q-toolbar-title>
        <!-- Botão de configuração -->
        <q-btn
          flat
          dense
          round
          icon="settings"
          aria-label="Configurações"
          @click="showDialog = true"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="column justify-between"
    >
      <q-list>
        <q-item-label header> Menu </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        <!-- Informações de autoria -->
      </q-list>
      <q-item class="text-caption">
        <label><strong>Developed by:</strong> Jonatas Lima </label></q-item
      >
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Dialog de configuração -->
    <q-dialog v-model="showDialog">
      <q-card>
        <div class="column items-end">
          <q-btn icon="close" flat @click="() => (showDialog = false)"></q-btn>
        </div>
        <q-card-section class="q-pt-none">
          <div class="text-h6">Configurações</div>
        </q-card-section>
        <q-card-section>
          <q-toggle
            v-model="confirmDeleteItem"
            label="Confirmar exclusão de item"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useConfig } from "src/stores/config-store";
import { storeToRefs } from "pinia";
const linksList = [
  {
    title: "Reportar Bug/Feedback",
    caption:
      "Envie um e-mail para reportar um bug ou dar um feedback/sugestão.",
    icon: "bug_report",
    link: "mailto:jonataslimafsa@gmail.com",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const configStore = useConfig();
    const { confirmDeleteItem } = storeToRefs(configStore);
    const leftDrawerOpen = ref(false);
    const showDialog = ref(false); // Nova referência para controlar a exibição do dialog

    onMounted(() => {
      leftDrawerOpen.value = false;
    });
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      showDialog,
      confirmDeleteItem,
    };
  },
});
</script>
