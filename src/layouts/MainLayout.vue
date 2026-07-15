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
          @click="() => (leftDrawerOpen = !leftDrawerOpen)"
        />
        <img
          src="@/assets/checklist.png"
          alt="ListAll Logo"
          style="height: 30px"
        />

        <q-toolbar-title> ListAll </q-toolbar-title>
        <!-- Botão de configuração -->
        <q-btn flat dense round icon="settings" aria-label="Configurações">
          <q-popup-proxy
            ref="configRef"
            transition-show="flip-up"
            transition-hide="flip-down"
          >
            <q-card>
              <q-card-section
                class="text-h6 text-bold q-pb-none row justify-between"
              >
                Configurações
                <q-btn
                  class="q-pa-none"
                  icon="close"
                  flat
                  @click="() => configRef.hide()"
                />
              </q-card-section>
              <q-card-section class="column">
                <q-toggle
                  v-model="confirmDeleteItem"
                  label="Confirmar exclusão de item"
                />
                <q-toggle
                  v-model="persistLastTabCategory"
                  label="Persistir última categoria"
                />
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>

        <q-btn flat dense round icon="info" aria-label="Sobre">
          <q-popup-proxy
            ref="aboutAppRef"
            transition-show="flip-up"
            transition-hide="flip-down"
          >
            <q-card>
              <q-card-section
                class="text-h6 text-bold q-pb-none row justify-between"
              >
                Sobre o aplicativo
                <q-btn
                  class="q-pa-none"
                  icon="close"
                  flat
                  @click="() => aboutAppRef.hide()"
                />
              </q-card-section>

              <q-card-section>
                Para feedback ou relatórios de bugs, por favor, envie um email
                para:
                <a
                  href="mailto:jonataslimafsa@gmail.com?subject=Feedback&body=Escreva seu feedback aqui..."
                >
                  jonataslimafsa@gmail.com
                </a>
              </q-card-section>
              <q-card-section>
                <strong>Versão:</strong> 0.3.0-alpha <br />
                <strong>Desenvolvido por:</strong> Jonatas D. J. Lima
                <br />
                <a href="https://github.com/limajonatas" target="_blank">
                  GitHub
                </a>
                <br />
                <a
                  href="https://www.linkedin.com/in/jonatas-lima-a001691a1/"
                  target="_blank"
                >
                  LinkedIn
                </a>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="column justify-between"
      :width="250"
    >
      <q-list>
        <q-item-label header class="text-bold"> Menu </q-item-label>

        <q-item
          clickable
          v-ripple
          v-for="link in essentialLinks"
          :key="link.title"
          @click="() => openLink(link.link)"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
            <q-item-label caption>{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { useConfig } from "src/stores/config-store";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "MainLayout",

  components: {},

  setup() {
    const linksList = ref([
      {
        title: "Reportar Bug/Feedback",
        caption:
          "Envie um e-mail para reportar um bug ou dar um feedback/sugestão.",
        icon: "bug_report",
        link: "mailto:jonataslimafsa@gmail.com",
      },
    ]);
    const configRef = ref(null);
    const aboutAppRef = ref(null);
    const $q = useQuasar();
    const configStore = useConfig();
    const { confirmDeleteItem, persistLastTabCategory } =
      storeToRefs(configStore);
    const leftDrawerOpen = ref(false);

    onMounted(() => {
      leftDrawerOpen.value = false;
    });

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      confirmDeleteItem,
      persistLastTabCategory,
      configRef,
      aboutAppRef,
    };
  },
});
</script>
