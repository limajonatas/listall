import { defineStore } from "pinia";
export const useConfig = defineStore("config", {
  state: () => ({
    confirmDeleteItem: true,
    persistLastTabCategory: true,
    lastTabCategory: 'to-do',
  }),
  persist:  true,
});
//
