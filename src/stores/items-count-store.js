import { defineStore } from "pinia";
import { Notify } from "quasar";
/*
countList: [
	{
    id: number,
    tagColor: string,
		nameList: string,
		data: [],
	}
]
item:{
  type: string,
  id: number,
  idList: number,
  tagColor: string,
  title: string,
  description: string,
  count: number,
}

*/
export const useCountItemsStore = defineStore("everyCountItems", {
  state: () => ({
    countItemsLists: JSON.parse(localStorage.getItem("countList")) || [], //lista de listas de itens contadores
    everyCountItems: [], //lista de todos os itens contadores
  }),

  getters: {
    tagColorList() {
      return this.countItemsLists.map((list) => list.tagColor);
    },
    getLastTagColor() {
      return this.tagColorList[this.tagColorList.length - 1];
    },
  },

  actions: {
    initEveryCountItems() {
      this.everyCountItems =
        JSON.parse(localStorage.getItem("everyCountItems")) || [];
      this.concatItems(); // Atualiza everyCountItems
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    createNewItem(title, description, tagColor, nameList) {
      //verifica se já existe uma lista com a cor fornecida
      let index = this.countItemsLists.findIndex(
        (list) => list.tagColor === tagColor
      );
      if (index === -1) {
        //se não existir, cria uma nova lista com a cor fornecida
        const id = this.countItemsLists.length + 1;
        this.countItemsLists.push({
          id: id,
          type: "count",
          tagColor: tagColor,
          nameList: nameList ?? "Lista " + id,
          data: [],
        });
        index = this.countItemsLists.findIndex((list) => list.id === id);
        this.countItemsLists[index].data.push({
          type: "count",
          id: this.countItemsLists[index].data.length + 1,
          idList: id,
          count: 0,
          title,
          description,
          tagColor,
        });
      } else {
        this.countItemsLists[index].data.push({
          type: "count",
          id: this.countItemsLists[index].data.length + 1,
          idList: this.countItemsLists[index].id,
          count: 0,
          title,
          description,
          tagColor,
        });
      }
      this.concatItems();
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    createNewList(nameList, tagColor) {
      const index = this.countItemsLists.findIndex(
        (list) => list.tagColor === tagColor
      );
      if (index === -1) {
        const id = this.countItemsLists.length + 1;
        this.countItemsLists.push({
          id: id,
          type: "count",
          tagColor: tagColor,
          nameList: nameList == "" ? "Lista " + id : nameList,
          data: [],
        });
        this.concatItems();
        Notify.create({
          message: "Lista criada com sucesso",
          color: "positive",
          icon: "done",
          position: "top",
          timeout: 2000,
        });
      } else {
        Notify.create({
          message:
            "Não foi possível criar a lista, pois já existe uma lista com essa cor",
          color: "red",
          icon: "report_problem",
          timeout: 3000,
          position: "top",
        });
        return false;
      }
      this.concatItems();
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
      return true;
    },
    editList(id, nameList, tagColor) {
      const index = this.findList(id);
      if (index === -1) {
        Notify.create({
          message: "Não foi possível editar a lista",
          color: "red",
          icon: "report_problem",
        });
        return null;
      }
      this.countItemsLists[index].nameList = nameList;
      if (tagColor) {
        const index = this.countItemsLists.findIndex(
          (list) => list.tagColor === tagColor
        );
        if (index === -1) {
          this.countItemsLists[index].tagColor = tagColor;
          this.countItemsLists[index].data.forEach((item) => {
            item.tagColor = tagColor;
          });
        } else {
          Notify.create({
            message:
              "Não foi possível editar a COR da lista, pois já existe uma lista com essa cor",
            color: "red",
            icon: "report_problem",
            timeout: 5000,
          });
        }
      }
      this.concatItems();
      this.saveItemsToLocalStorage();
    },

    editItem(id, idList, title, description, tagColor, changeList) {
      if (changeList) {
        const item = this.deleteItem(id, idList);
        this.createNewItem(title, description, tagColor);
        return item;
      }
      const indexList = this.findList(idList);
      if (indexList === -1) {
        Notify.create({
          message: "Não foi possível editar o item",
          color: "red",
          icon: "report_problem",
          position: "top",
        });
        return null;
      }
      //encontre o item com o id fornecido e edite-o
      const index = this.countItemsLists[indexList].data.findIndex(
        (item) => item.id === id
      );
      if (index === -1) {
        Notify.create({
          message: "Não foi possível editar o item",
          color: "red",
          icon: "report_problem",
          position: "top",
        });
        return null;
      }
      this.countItemsLists[indexList].data[index].title = title;
      this.countItemsLists[indexList].data[index].description = description;
      this.countItemsLists[indexList].data[index].tagColor = tagColor;

      this.concatItems();
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    deleteItem(id, idList) {
      const indexList = this.findList(idList);
      if (indexList === -1) {
        Notify.create({
          message: "Não foi possível excluir o item",
          color: "red",
          icon: "report_problem",
          position: "top",
        });
        return null;
      }
      //encontre o item com o id fornecido e retorne o item excluído
      const index = this.countItemsLists[indexList].data.findIndex(
        (item) => item.id === id
      );
      if (index === -1) {
        Notify.create({
          message: "Não foi possível excluir o item",
          color: "red",
          icon: "report_problem",
          position: "top",
        });
        return null;
      }
      const item = this.countItemsLists[indexList].data[index];
      this.countItemsLists[indexList].data.splice(index, 1);

      this.concatItems();
      this.saveItemsToLocalStorage();
      return item;
    },
    incrementCount(id, idList) {
      const indexList = this.findList(idList);
      if (indexList === -1) {
        Notify.create({
          message: "Não foi possível incrementar o contador",
          color: "red",
          icon: "report_problem",
          position: "top",
        });
        return null;
      }
      //encontre o item com o id fornecido e incremente seu contador
      const index = this.countItemsLists[indexList].data.findIndex(
        (item) => item.id === id
      );
      if (index === -1) {
        Notify.create({
          message: "Não foi possível incrementar o contador",
          color: "red",
          icon: "report_problem",
          position: "top",
        });
        return null;
      }
      this.countItemsLists[indexList].data[index].count++;

      this.concatItems();
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    decrementCount(id, idList) {
      const indexList = this.findList(idList);
      if (indexList === -1) {
        Notify.create({
          message: "Não foi possível decrementar o contador",
          color: "red",
          icon: "report_problem",
          position: "top",
        });
        return null;
      }
      //encontre o item com o id fornecido e decremente seu contador
      const index = this.countItemsLists[indexList].data.findIndex(
        (item) => item.id === id
      );
      if (index === -1) {
        Notify.create({
          message: "Não foi possível decrementar o contador",
          color: "red",
          icon: "report_problem",
          position: "top",
        });
        return null;
      }
      if (this.countItemsLists[indexList].data[index].count > 0) {
        this.countItemsLists[indexList].data[index].count--;

        this.concatItems();
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
    findList(id) {
      return this.countItemsLists.findIndex((list) => list.id === id);
    },
    saveItemsToLocalStorage() {
      localStorage.setItem("countList", JSON.stringify(this.countItemsLists));
      localStorage.setItem(
        "everyCountItems",
        JSON.stringify(this.everyCountItems)
      );
    },
  },
});
