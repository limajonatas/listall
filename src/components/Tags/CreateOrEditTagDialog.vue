<template>
  <dialog-base
    :model-value="modelValue"
    :title="isEdit ? 'Editar Tag' : 'Nova Tag'"
    @update:model-value="$emit('update:modelValue', $event)"
    @save="saveTag"
    :save-label="isEdit ? 'Salvar' : 'Criar'"
    :save-color="isEdit ? 'warning' : 'primary'"
    cancel-label="Cancelar"
    :v-close-popup-save="true"
  >
    <q-form @submit="saveTag" class="q-gutter-md q-pa-sm">
      <q-input
        v-model="form.name"
        label="Nome da Tag"
        outlined
        dense
        required
        autofocus
      />

      <div class="q-mt-md">
        <div class="text-caption q-mb-sm text-grey-8">Cor</div>
        <div class="row q-gutter-sm">
          <q-btn
            v-for="color in defaultColors"
            :key="color"
            :style="{ backgroundColor: color }"
            round
            size="sm"
            @click="form.color = color"
            :icon="form.color === color ? 'check' : ''"
            :text-color="getContrastColor(color)"
          />
        </div>
      </div>

      <q-input
        v-model="form.color"
        label="Cor (Hexadecimal)"
        outlined
        dense
        class="q-mt-sm"
      >
        <template v-slot:append>
          <q-icon
            name="colorize"
            class="cursor-pointer"
            :style="{ color: form.color }"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-color v-model="form.color" no-header />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </q-form>

  </dialog-base>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref, watch } from "vue";
import { tagService } from "src/db/dbServices";
import { randomColor, getContrastColor } from "src/utils/utils";

export default defineComponent({
  name: "CreateOrEditTagDialog",
  components: {
    DialogBase: defineAsyncComponent(() =>
      import("src/components/DialogBase.vue")
    ),
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    tagToEdit: {
      type: Object,
      default: null,
    },
  },
  emits: ["update:modelValue", "saved"],
  setup(props, { emit }) {
    const isEdit = ref(false);
    const form = ref({
      name: "",
      color: "#000000",
    });

    const defaultColors = [
      "#E57373",
      "#F06292",
      "#BA68C8",
      "#9575CD",
      "#7986CB",
      "#64B5F6",
      "#4FC3F7",
      "#4DD0E1",
      "#4DB6AC",
      "#81C784",
      "#AED581",
      "#DCE775",
      "#FFF176",
      "#FFD54F",
      "#FFB74D",
      "#FF8A65",
      "#A1887F",
      "#E0E0E0",
      "#90A4AE",
    ];

    watch(
      () => props.modelValue,
      (val) => {
        if (val) {
          if (props.tagToEdit) {
            isEdit.value = true;
            form.value = { ...props.tagToEdit };
          } else {
            isEdit.value = false;
            form.value = {
              name: "",
              color: randomColor(),
            };
          }
        }
      }
    );

    async function saveTag() {
      if (!form.value.name) return;

      try {
        if (isEdit.value) {
          await tagService.update(form.value.id, form.value);
        } else {
          await tagService.add(form.value);
        }
        emit("saved");
        emit("update:modelValue", false);
      } catch (error) {
        console.error("Erro ao salvar tag:", error);
      }
    }

    return {
      isEdit,
      form,
      saveTag,
      defaultColors,
      getContrastColor,
    };
  },
});
</script>
