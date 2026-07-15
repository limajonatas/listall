<template>
  <q-item
    clickable
    v-ripple
    dense
    class="rounded-borders q-pa-sm shadow-2"
    @click="(evt) => onDoubleClick(evt, item)"
  >
    <q-item-section>
      <span
        class="text-bold text-h6"
        :class="{ 'line-through text-grey': item.check }"
      >
        {{ item.title }}
      </span>

      <span style="word-break: break-word">
        {{ item.description }}
      </span>

      <!--TAGs-->
      <div class="flex row" v-if="item.tags.length > 0">
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
    </q-item-section>

    <q-item-section side v-if="isTodo || isCount">
      <q-checkbox
        v-if="isTodo"
        v-model="checkItem"
        @update:model-value="
          (value) => $emit('check', { id: item.id, check: value })
        "
      />

      <div class="flex row items-center" v-else>
        <span class="text-h2 text-bold q-px-md">{{ item.value }}</span>
        <div class="column q-gutter-y-sm">
          <q-btn
            dense
            icon="keyboard_arrow_up"
            color="secondary"
            @click.stop="$emit('increment', item)"
          />
          <q-btn
            dense
            icon="keyboard_arrow_down"
            color="grey"
            :disable="item.count === 0"
            @click.stop="$emit('decrement', item)"
          />
        </div>
      </div>
    </q-item-section>

    <q-menu
      :no-parent-event="$q.platform.is.mobile"
      anchor="center middle"
      self="top middle"
      v-model="menu"
      :context-menu="$q.platform.is.desktop"
      @show="menu = true"
      @hide="menu = false"
    >
      <q-list dense>
        <q-item clickable v-close-popup @click="$emit('edit', item)">
          <q-avatar>
            <q-icon name="edit" size="xs" />
          </q-avatar>
          <q-item-section>Editar</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="$emit('duplicate', item)">
          <q-avatar>
            <q-icon name="content_copy" size="xs" />
          </q-avatar>
          <q-item-section>Duplicar</q-item-section>
        </q-item>
        <!---INFO-->
        <q-item>
          <q-badge
          outline
            style="font-size: 11px; color: grey; line-height: 12px"
            class="column q-mb-sm"
          >
            <span> Criado em: {{ formatDate(item.createdAt) }} </span>
            <span v-if="item.updatedAt">
              Última atualização: {{ formatDate(item.updatedAt) }}
            </span>
            <span v-if="item.checkedAt" class="text-accent">
              Concluído em: {{ formatDate(item.checkedAt) }}
            </span>
          </q-badge>
        </q-item>
      </q-list>
    </q-menu>
  </q-item>
</template>

<script>
import { tagService } from "src/db/dbServices";
import { defineComponent, computed, ref, onMounted, nextTick } from "vue";
import { formatDate } from "src/utils/utils";

export default defineComponent({
  name: "CardItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
    isTodo: {
      type: Boolean,
      default: false,
    },
    isCount: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["check", "increment", "decrement", "edit", "duplicate"],
  setup(props, { emit }) {
    const checkItem = ref(props.item.check);
    const tags = ref([]);

    const tagsSelectedData = computed(() => {
      return props.item.tags.map((id) => {
        return tags.value.find((tag) => tag.id === id);
      });
    });
    function getContrastColor(hex) {
      if (!hex) return;
      hex = hex.replace("#", "");

      if (hex.length === 3) {
        hex = hex
          .split("")
          .map((c) => c + c)
          .join("");
      }

      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // fórmula de luminosidade relativa
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      return luminance > 0.5 ? "black" : "white";
    }

    function getAllTags() {
      tagService.getAll().then((tagsResponse) => {
        tags.value = tagsResponse;
      });
    }

    const menu = ref(false);

    async function onDoubleClick(evt) {
      if (evt.detail === 2) {
        menu.value = true;
        await nextTick();
      }
    }
    onMounted(() => {
      getAllTags();
    });

    return {
      checkItem,
      getContrastColor,
      tagsSelectedData,
      menu,
      onDoubleClick,
      formatDate,
    };
  },
});
</script>

<style lang="scss" scoped>
.line-through {
  text-decoration: line-through;
}
.text-grey {
  color: #888;
}
</style>
