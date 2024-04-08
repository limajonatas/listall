import { defineStore } from "pinia";
export const useConfig = defineStore("config", {
  state: () => ({
    confirmDeleteItem: true,
  }),
  persist:  true,
});
//
