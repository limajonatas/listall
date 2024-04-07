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
    getUniqueTitle(title, tagColor, indexList, index) {
      // Inicializa o novo título com o título fornecido
      let newTitle = title;
      let match;
      let counter = 1;

      // Continua o loop enquanto houver algum item na lista de dados com o mesmo título e cor de tag
      while (
        this.countItemsLists[indexList].data.some(
          (item, itemIndex) =>
            // Verifica se o título e a cor da tag são os mesmos
            item.title === newTitle &&
            item.tagColor === tagColor &&
            // E se o índice do item não é o mesmo que o índice do item que está sendo editado
            // Isso é para evitar que o título do item que está sendo editado seja alterado
            // se ele já tiver o mesmo título e cor de tag
            itemIndex !== index
        )
      ) {
        // Verifica se o título já termina com "_<número>"
        match = newTitle.match(/_(\d+)$/);

        // Se o título já termina com "_<número>", incrementa esse número
        if (match) {
          counter = parseInt(match[1]) + 1;
          newTitle = `${newTitle.slice(0, match.index)}_${counter}`;
        } else {
          // Se o título não termina com "_<número>", adiciona "_1" ao título
          newTitle = `${newTitle}_1`;
        }
      }

      // Retorna o novo título
      return newTitle;
    },
    initEveryCountItems() {
      this.everyCountItems =
        JSON.parse(localStorage.getItem("everyCountItems")) || [];
      this.concatItems(); // Atualiza everyCountItems
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    createNewItem(title, description, tagColor, nameList, count, editItem) {
      title = title.toUpperCase();

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
          menu: false,
        });
      } else {
        // let newTitle = title;
        // let match;
        // let counter = 1;

        // while (
        //   this.countItemsLists[index].data.some(
        //     (item) => item.title === newTitle && item.tagColor === tagColor
        //   )
        // ) {
        //   match = newTitle.match(/_(\d+)$/);

        //   //EXEMPLO: se o título for "Item_1" o match será ["_1", "1"] então o titulo será "Item_2"
        //   if (match) {
        //     counter = parseInt(match[1]) + 1;
        //     newTitle = `${newTitle.slice(0, match.index)}_${counter}`;
        //   } else {
        //     newTitle = `${newTitle}_1`;
        //   }
        // }

        try {

          let newTitle = this.getUniqueTitle(title, tagColor, index, this.countItemsLists[index].data.length);
          this.countItemsLists[index].data.push({
            type: "count",
            id: this.countItemsLists[index].data.length + 1,
            idList: this.countItemsLists[index].id,
            count: count ?? 0, //no caso de duplicar um item, o contador é mantido
            title: newTitle,
            description,
            tagColor,
          });

          if (newTitle !== title) {
            //o nome pode ja existir ou pode ser uma duplicação
            if (count > -1) {
              //se for uma duplicação existira o parametro count
              Notify.create({
                message: "Item duplicado com sucesso",
                color: "positive",
                icon: "done",
                position: "top",
              });
            } else {
              Notify.create({
                message:
                  "Ja existe um item com esse nome, mas criamos um item com um nome diferente",
                color: "info",
                icon: "warning",
                position: "top",
              });
            }
          } else {
            Notify.create({
              message: "Item criado com sucesso",
              color: "positive",
              icon: "done",
              position: "top",
              timeout: 2000,
            });
          }
        } catch (e) {
          console.log(e);
          Notify.create({
            message: "Não foi possível criar o item",
            color: "red",
            icon: "report_problem",
            position: "top",
          });
        }
      }
      this.concatItems();
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
    },
    createNewList(nameList, tagColor) {
      //verifica se já existe uma lista com a cor fornecida
      const index = this.countItemsLists.findIndex(
        (list) => list.tagColor === tagColor
      );
      if (index === -1) {
        //se não existir, cria uma nova lista com a cor fornecida
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

    editItem(id, idList, title, description, idNewList) {
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
      //edite o item
      if (idNewList !== idList) {
        //mude o item de lista
        const indexNewList = this.findList(idNewList);
        if (indexNewList === -1) {
          Notify.create({
            message: "Não foi possível editar o item",
            color: "red",
            icon: "report_problem",
            position: "top",
          });
          return null;
        }

        const item = this.deleteItem(id, idList); //exclua o item da lista antiga
        //crie um novo item na nova lista
        this.createNewItem(
          title,
          description,
          //color vai ser da lista nova
          this.countItemsLists[indexNewList].tagColor,
          this.countItemsLists[indexNewList].nameList,
          item.count
        );
      } else {
        let uniqueTitle = this.getUniqueTitle(
          title,
          this.countItemsLists[indexList].tagColor,
          indexList
        );
        this.countItemsLists[indexList].data[index].title = uniqueTitle;
        this.countItemsLists[indexList].data[index].description = description;
      }

      this.concatItems();
      this.saveItemsToLocalStorage(); // Salve os dados no localStorage após cada alteração
      Notify.create({
        message: "Item editado com sucesso",
        color: "positive",
        icon: "done",
        position: "top",
        timeout: 2000,
      });
      return true;
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
      //concatena todos os itens de todas as listas
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
