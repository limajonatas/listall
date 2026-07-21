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
        <slot name="footer"> </slot>
      </q-card-section>
      <q-card-actions
        align="right"
        :class="paddingCard"
        v-if="cancelButtonLabel || okButtonLabel"
      >
        <q-btn
          v-if="cancelButtonLabel"
          :label="cancelButtonLabel"
          :color="cancelButtonColor"
          flat
          v-close-popup="vClosePopupCancelButton"
          @click="$emit('cancelButton')"
        />
        <q-btn
          v-if="okButtonLabel"
          :label="okButtonLabel"
          :color="okButtonColor"
          @click="$emit('okButton')"
          v-close-popup="vClosePopupOkButton"
          :disable="disableOkButton"
        />
      </q-card-actions>
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
      required: true,
    },
    colorTitle: {
      type: String,
      default: "text-primary",
    },
    paddingCard: {
      type: String,
      default: "",
    },
    cancelButtonLabel: {
      type: String,
      default: "",
    },
    cancelButtonColor: {
      type: String,
      default: "grey",
    },
    okButtonLabel: {
      type: String,
      default: "",
    },
    okButtonColor: {
      type: String,
      default: "primary",
    },
    vClosePopupCancelButton: {
      type: Boolean,
      default: true,
    },
    vClosePopupOkButton: {
      type: Boolean,
      default: false,
    },
    disableOkButton: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "hide", "show", "okButton", "cancelButton"],
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped></style>
