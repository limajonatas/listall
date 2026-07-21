<template>
  <dialog-base
    :model-value="modelValue"
    :title="item.title"
    :color-title="item.check ? 'line-through text-grey' : ''"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!--DESCRIÇÃO-->
    <div v-if="item.description" class="description-section q-mb-sm">
      <p class="text-body1" style="word-break: break-word; margin: 0">
        {{ item.description }}
      </p>
    </div>

    <!--TAGs-->
    <div class="flex row q-mb-sm" v-if="item.tags.length > 0">
      <div v-for="tag in tagsSelectedData" :key="tag?.id" style="padding: 2px">
        <q-badge
          :style="{
            backgroundColor: tag?.color,
            color: getContrastColor(tag?.color),
          }"
        >
          # {{ tag?.name ?? "" }}
        </q-badge>
      </div>
    </div>

    <q-separator />

    <!--RODAPÉ COM DATAS-->
    <div
      class="text-grey column q-gutter-y-xs q-mt-sm"
      style="line-height: 8pt; font-size: 9pt"
    >
      <div>Criado em: {{ formatDate(item.createdAt) }}</div>
      <div v-if="item.updatedAt">
        Atualizado em: {{ formatDate(item.updatedAt) }}
      </div>
      <div v-if="item.checkedAt" class="text-accent">
        Concluído em: {{ formatDate(item.checkedAt) }}
      </div>
    </div>

    <!--AÇÕES-->
    <template #footer>
      <q-card-actions align="right" class="actions-buttons q-pa-none">
        <q-btn
          flat
          dense
          icon="content_copy"
          label="Duplicar"
          color="primary"
          v-close-popup
          @click="$emit('duplicate', item)"
          class="actions-buttons__button"
        />
        <q-btn
          flat
          dense
          icon="edit"
          label="Editar"
          color="orange"
          v-close-popup
          @click="$emit('edit', item)"
          class="actions-buttons__button"
        />
        <q-btn
          flat
          dense
          icon="delete"
          label="Excluir"
          color="negative"
          v-close-popup
          @click="$emit('delete', item)"
          class="actions-buttons__button"
        />
      </q-card-actions>
    </template>
  </dialog-base>
</template>

<script>
import { formatDate, getContrastColor } from "src/utils/utils";
import { defineComponent, computed, ref, onMounted } from "vue";
import DialogBase from "src/components/DialogBase.vue";

export default defineComponent({
  name: "ShowDetailsItem",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      required: true,
    },
    globalTags: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "edit", "duplicate", "delete"],
  components: { DialogBase },
  setup(props) {
    // Mapeia os IDs das tags vinculadas ao item usando as tags globais enviadas pelo Listador
    // Garante que mostremos a propriedade name e color da tag atualizada em tempo real
    const tagsSelectedData = computed(() => {
      if (!props.item.tags || props.item.tags.length === 0) return [];
      return props.item.tags
        .map((id) => {
          return props.globalTags.find((tag) => tag.id === id);
        })
        .filter(Boolean);
    });

    return { getContrastColor, formatDate, tagsSelectedData };
  },
});
</script>

<style lang="scss" scoped>
.description-section {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

@media (max-width: 400px) {
  .description-section {
    max-height: calc(100vh - 400px);
    overflow-y: auto;
  }
  .actions-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    &__button {
      width: 100%;
    }
  }
}
</style>
