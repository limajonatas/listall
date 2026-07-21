<template>
  <q-item
    clickable
    v-ripple
    dense
    class="rounded-borders q-pa-sm shadow-2 fit"
    @click="detailDialog = true"
  >
    <q-item-section top>
      <div
        class="text-bold text-h6 title-clamp"
        :class="{ 'line-through text-grey': item.check }"
      >
        {{ item.title }}
      </div>

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
        @click.stop
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
            :disable="item.value === 0"
            @click.stop="$emit('decrement', item)"
          />
        </div>
      </div>
    </q-item-section>

    <!--DIALOG DE DETALHES-->
    <show-details-item
      v-model="detailDialog"
      :item="item"
      :global-tags="globalTags"
      @edit="$emit('edit', item)"
      @duplicate="$emit('duplicate', item)"
      @delete="$emit('delete', item)"
    />
  </q-item>
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  defineAsyncComponent,
} from "vue";
import { formatDate, getContrastColor } from "src/utils/utils";

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
    globalTags: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["check", "increment", "decrement", "edit", "duplicate", "delete"],
  setup(props) {
    const checkItem = ref(props.item.check);
    const detailDialog = ref(false);

    // Mapeia os dados completos das tags (nome, cor) baseados nos IDs vindos de props.item.tags
    // Faz o cruzamento de dados com props.globalTags que veio da IndexPage (evitando N repetidos reads do IndexedDB)
    const tagsSelectedData = computed(() => {
      if (!props.item.tags || props.item.tags.length === 0) return [];
      return props.item.tags
        .map((id) => {
          return props.globalTags.find((tag) => tag.id === id);
        })
        .filter(Boolean); // filtra caso alguma tag não exista
    });

    return {
      checkItem,
      getContrastColor,
      tagsSelectedData,
      detailDialog,
      formatDate,
    };
  },
  components: {
    ShowDetailsItem: defineAsyncComponent(() =>
      import("./ShowDetailsItem.vue")
    ),
  },
});
</script>

<style lang="scss" scoped>
.title-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  line-height: 20pt;
}
</style>
