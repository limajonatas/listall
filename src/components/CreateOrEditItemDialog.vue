<template>
  <q-dialog>
    <q-card style="min-width: 300px; width: 100%; max-width: 500px">
      <q-card-section class="flex row justify-between items-center q-pb-none">
        <span
          v-text="editingItem ? 'Editar Item' : 'Novo Item'"
          class="text-bold text-h6"
          :class="editingItem ? 'text-orange' : 'text-primary'"
        />
        <q-btn icon="close" flat dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="$emit('submit')">
          <!--TITULO-->
          <q-input
            class="full-width"
            filled
            dense
            :model-value="title"
            label="Título"
            lazy-rules
            :rules="[(val) => val.length <= 40 || 'Máximo de 40 caracteres']"
          />
          <!--DESCRIÇÃO-->
          <q-input
            type="textarea"
            rows="3"
            class="full-width q-mt-sm"
            filled
            dense
            :model-value="description"
            label="Descrição (opcional)"
          />

          <!--COUNT-->
          <q-input
            v-if="listType == 'count'"
            class="full-width q-mt-sm"
            filled
            dense
            :model-value="countStart"
            type="number"
            label="Iniciar com"
          />

          <!--TAGs selecionadas-->
          <div class="flex row q-mt-sm">
            <div
              v-for="tag in tagsSelectedData"
              :key="tag?.id"
              style="padding: 2px"
            >
              <q-badge
                :style="{
                  backgroundColor: tag?.color,
                  color: getContrastColor(tag?.color),
                }"
              >
                # {{ tag?.name }}
              </q-badge>
            </div>
          </div>

          <!--LIST TYPE-->
          <div :class="$q.screen.gt.xs ? 'row justify-between' : 'column q-gutter-y-sm items-end'">
            <q-btn-group push rounded>
              <q-btn
                label="to-do"
                :color="listType == 'to-do' ? 'primary' : undefined"
                style="border-right: 1px solid #ccc"
                icon="checklist"
                dense
              />
              <q-btn
                label="simples"
                :color="listType == 'simples' ? 'primary' : undefined"
                style="border-right: 1px solid #ccc"
                icon="list"
                dense
              />
              <q-btn
                label="contador"
                :color="listType == 'count' ? 'primary' : undefined"
                icon="exposure_plus_1"
                dense
              />
            </q-btn-group>

            <div class="row q-gutter-x-sm">
              <!-- TAG -->
              <q-btn icon="tag" dense @click="$emit('openTags')" />
              <!--SALVAR-->
              <q-btn
                :class="$q.screen.gt.xs ? 'q-pr-sm' : 'q-pl-md q-pr-lg'"
                type="submit"
                :color="editingItem ? 'orange' : 'primary'"
                :icon="editingItem ? 'edit' : 'add'"
                :label="editingItem ? 'Editar' : 'Criar'"
                dense
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="js">
import { defineComponent } from 'vue'
import { getContrastColor } from 'src/utils/utils'
export default defineComponent({
  name: 'CreateOrEditItemDialog',
  props: {
    editingItem: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    countStart: {
      type: [Number, String],
      default: 0,
    },
    listType: {
      type: String,
      default: 'to-do',
    },
    tagsSelectedData: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    'submit',
    'openTags',
  ],
  setup() {
    return { getContrastColor };
  },
});
</script>

<style lang="scss" scoped></style>
