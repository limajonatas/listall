<template>
  <q-dialog @click.stop>
    <q-card style="min-width: 300px; width: 100%; max-width: 480px">
      <!--HEADER-->
      <q-card-section class="q-pb-xs">
        <div class="flex row justify-between items-start">
          <span
            class="text-bold text-h6"
            :class="{ 'line-through text-grey': item.check }"
            style="word-break: break-word; flex: 1"
          >
            {{ item.title }}
          </span>
          <q-btn icon="close" flat dense v-close-popup class="q-ml-sm" />
        </div>
      </q-card-section>

      <q-separator />

      <!--DESCRIÇÃO-->
      <q-card-section
        class="q-py-xs description-section"
        v-if="item.description"
      >
        <p class="text-body1" style="word-break: break-word; margin: 0">
          {{ item.description }}
        </p>
      </q-card-section>

      <!--TAGs-->
      <q-card-section class="q-pt-xs" v-if="item.tags.length > 0">
        <div class="flex row">
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
              # {{ tag?.name ?? "" }}
            </q-badge>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!--RODAPÉ COM DATAS-->
      <q-card-section class="q-py-sm" style="line-height: 8pt; font-size: 9pt">
        <div class="text-grey column q-gutter-y-xs">
          <div>Criado em: {{ formatDate(item.createdAt) }}</div>
          <div v-if="item.updatedAt">
            Atualizado em: {{ formatDate(item.updatedAt) }}
          </div>
          <div v-if="item.checkedAt" class="text-accent">
            Concluído em: {{ formatDate(item.checkedAt) }}
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!--AÇÕES-->
      <q-card-actions align="right" class="actions-buttons">
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
    </q-card>
  </q-dialog>
</template>

<script>
import { tagService } from "src/db/dbServices";
import { formatDate, getContrastColor } from "src/utils/utils";
import { defineComponent, computed, ref, onMounted } from "vue";

export default defineComponent({
  name: "ShowDetailsItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  emits: ["edit", "duplicate", "delete"],
  setup(props, { emit }) {
    const tags = ref([]);

    const tagsSelectedData = computed(() => {
      return props.item.tags.map((id) => {
        return tags.value.find((tag) => tag.id === id);
      });
    });

    function getAllTags() {
      tagService.getAll().then((tagsResponse) => {
        tags.value = tagsResponse;
      });
    }

    onMounted(() => {
      getAllTags();
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
