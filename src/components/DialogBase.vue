<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @hide="$emit('hide')"
    @show="$emit('show')"
  >
    <q-card style="min-width: 300px; width: 100%; max-width: 500px">
      <!--HEADER-->
      <q-card-section
        class="flex row justify-between items-center q-pb-none"
        :class="
          paddingCard
            ? paddingCard
            : $q.platform.is.mobile
            ? 'q-px-sm q-pt-xs q-pb-sm'
            : ''
        "
      >
        <!--TITLE-->
        <span
          v-text="title"
          class="text-bold text-h6 q-pr-xl"
          :class="colorTitle"
        />
        <q-btn icon="close" flat dense v-close-popup />
      </q-card-section>

      <!--BODY-->
      <q-card-section :class="paddingCard">
        <slot></slot>
      </q-card-section>

      <!--FOOTER-->
      <q-card-section :class="paddingCard" v-if="$slots.footer">
        <slot name="footer"></slot>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "dialog-base",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    colorTitle: {
      type: String,
      default: "text-primary",
    },
    paddingCard: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "hide", "show"],
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped></style>
