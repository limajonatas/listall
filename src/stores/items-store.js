import { defineStore } from "pinia";

export const useItemsStore = defineStore('items', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('items')) || [], // Carregue os dados do localStorage
  }),
  actions: {
    createNewItem(title, description) {
      this.items.push({
        id: this.items.length + 1,
        title,
        description,
      });
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    deleteItem(id) {
      this.items = this.items.filter((item) => item.id !== id);
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    saveItemsToLocalStorage() {
      localStorage.setItem('items', JSON.stringify(this.items));
    },
  },
});
