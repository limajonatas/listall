<template>
  <dialog-base
    :model-value="modelValue"
    :title="editingItem ? 'Editar Item' : 'Novo Item'"
    :color-title="editingItem ? 'text-orange' : 'text-primary'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-form @submit="$emit('submit')">
      <!--TITULO-->
      <q-input
        class="full-width"
        filled
        dense
        :model-value="title"
        @update:model-value="$emit('update:title', $event)"
        label="Título"
        maxlength="40"
        counter
        lazy-rules
        :rules="[(val) => val.length <= 40 || 'Máximo de 40 caracteres']"
      />
      <!--DESCRIÇÃO-->
      <q-input
        type="textarea"
        rows="5"
        class="full-width q-mt-sm"
        filled
        dense
        :model-value="description"
        @update:model-value="$emit('update:description', $event)"
        label="Descrição (opcional)"
      />

      <!--COUNT-->
      <q-input
        v-if="listType == 'count'"
        class="full-width q-mt-sm"
        filled
        dense
        :model-value="countStart"
        @update:model-value="$emit('update:countStart', $event)"
        type="number"
        :label="editingItem ? 'Valor atual' : 'Valor inicial'"
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
      <div
        :class="
          $q.screen.gt.xs
            ? 'row justify-between'
            : 'column q-gutter-y-sm items-center'
        "
      >
        <q-btn-group push rounded>
          <q-btn
            label="to-do"
            :color="listType == 'to-do' ? 'primary' : undefined"
            style="border-right: 1px solid #ccc"
            icon="checklist"
            dense
            @click="$emit('update:listType', 'to-do')"
          />
          <q-btn
            label="simples"
            :color="listType == 'simples' ? 'primary' : undefined"
            style="border-right: 1px solid #ccc"
            icon="list"
            dense
            @click="$emit('update:listType', 'simples')"
          />
          <q-btn
            label="contador"
            :color="listType == 'count' ? 'primary' : undefined"
            icon="exposure_plus_1"
            dense
            @click="$emit('update:listType', 'count')"
          />
        </q-btn-group>

        <div
          class="flex row q-gutter-x-sm"
          :class="$q.screen.gt.xs ? '' : 'full-width'"
        >
          <!-- TAG -->
          <q-btn
            icon="tag"
            :class="$q.screen.gt.xs ? '' : 'col-2'"
            dense
            @click="$emit('openTags')"
          />
          <!--SALVAR-->
          <q-btn
            :class="$q.screen.gt.xs ? 'q-pr-sm' : 'col q-pl-md q-pr-lg'"
            type="submit"
            :color="editingItem ? 'orange' : 'primary'"
            :icon="editingItem ? 'edit' : 'add'"
            :label="editingItem ? 'Editar' : 'Criar'"
            dense
          />
        </div>
      </div>
    </q-form>
  </dialog-base>
</template>

<script>
import { defineComponent } from "vue";
import { getContrastColor } from "src/utils/utils";
import DialogBase from "src/components/DialogBase.vue";

export default defineComponent({
  name: "CreateOrEditItemDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    editingItem: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    countStart: {
      type: [Number, String],
      default: 0,
    },
    listType: {
      type: String,
      default: "to-do",
    },
    tagsSelectedData: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    "update:modelValue",
    "submit",
    "openTags",
    "update:title",
    "update:description",
    "update:countStart",
    "update:listType",
  ],
  components: {
    DialogBase,
  },
  setup() {
    return { getContrastColor };
  },
});
</script>

<style lang="scss" scoped></style>
