import { defineStore } from "pinia";
/*
countList: [
	{
		nameList: "example",
		data: []
	}
]





*/
export const useItemsStore = defineStore("items", {
  state: () => ({
    countItemsLists: JSON.parse(localStorage.getItem("countList")) || [], //lista de listas de itens contadores
    everyCountItems: [], //lista de todos os itens contadores
  }),
  
  actions: {
    createNewItem(title, description, bookmark) {
      this.items.push({
        id: this.items.length + 1,
        count: 0,
        title,
        description,
        bookmark: bookmark,
      });
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    deleteItem(id) {
      //exclua o item com o id fornecido e retorne o item excluído
      const index = this.items.findIndex((item) => item.id === id);
      const item = this.items[index];
      this.items.splice(index, 1);
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
      return item;
    },
    incrementCount(id) {
      //encontre o item com o id fornecido e incremente seu contador
      const index = this.items.findIndex((item) => item.id === id);
      this.items[index].count++;
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    decrementCount(id) {
      //encontre o item com o id fornecido e decremente seu contador
      const index = this.items.findIndex((item) => item.id === id);
      if (this.items[index].count > 0) {
        this.items[index].count--;
        this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
      }
    },
    concatItems() {
      const concatenatedItemsLists = this.countItemsLists.reduce(
        (acc, list) => {
          return acc.concat(list.data);
        },
        []
      );
      this.everyCountItems = concatenatedItemsLists;
    },
    saveItemsToLocalStorage() {
      localStorage.setItem("items", JSON.stringify(this.items));
    },
  },
});
