import db from "./db";

/**
 * @typedef {Object} Todo
 * @property {number} [id]
 * @property {string} title - Título da tarefa
 * @property {string} description - Descrição detalhada
 * @property {string[]} history - Histórico de alterações (começar vazio [])
 * @property {number[]} tags - IDs das tags relacionadas
 * @property {boolean} check - Se a tarefa foi concluída
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * @typedef {Object} List
 * @property {number} [id]
 * @property {string} title
 * @property {string} description
 * @property {string[]} history
 * @property {number[]} tags
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * @typedef {Object} Counter
 * @property {number} [id]
 * @property {string} title
 * @property {string} description
 * @property {string[]} history
 * @property {number[]} tags
 * @property {number} value - valor inicial do contador
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * @typedef {Object} Tag
 * @property {number} [id]
 * @property {string} name - nome da tag
 * @property {string} color - cor em HEX ou nome ('#ff0000' ou 'red')
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

// =======================
// CRUD para TODO
// =======================
export const todoService = {
  /**
   * Adiciona um novo TODO
   *
   * Espera um objeto com:
   * {
   *   title: string,
   *   description: string,
   *   history: string[],
   *   tags: number[],
   *   check: boolean
   * }
   * @param {Todo} todo
   * @returns {Promise<number>} ID do registro criado
   */
  async add(todo) {
    const safeTodo = JSON.parse(JSON.stringify(todo));
    return await db.todo.add({
      ...safeTodo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  /** @returns {Promise<Todo[]>} */
  async getAll() {
    const todos = await db.todo.toArray();

    return todos.sort((a, b) => {
      // não concluídos primeiro
      if (a.check !== b.check) return a.check ? 1 : -1;

      // se ambos não concluídos, ordenar por createdAt decrescente (últimos criados primeiro)
      if (!a.check) return new Date(b.createdAt) - new Date(a.createdAt);

      // se ambos concluídos, ordenar por updatedAt decrescente
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  },

  /** @param {number} id @returns {Promise<Todo|undefined>} */
  async getById(id) {
    return await db.todo.get(id);
  },

  /**
   * Espera um objeto com:
   * {
   *   title: string,
   *   description: string,
   *   history: string[],
   *   tags: number[],
   *   check: boolean,
   *  type: string (todo, simples, count)
   * }
   * @param {number} id @param {Partial<Todo>} changes */
  async update(id, changes) {
    const safeChanges = JSON.parse(JSON.stringify(changes));
    return await db.todo.update(id, {
      ...safeChanges,
      updatedAt: new Date().toISOString(),
    });
  },

  /** @param {number} id */
  async remove(id) {
    return await db.todo.delete(id);
  },

  /**
   * Atualiza apenas o check de um TODO
   * @param {number} id - ID do item
   * @param {boolean} check - Novo valor do check
   * @returns {Promise<boolean>} - true se atualizado, false se não
   */
  async updateCheck(id, check) {
    return await db.todo.update(id, {
      check,
      updatedAt: new Date().toISOString(),
      checkedAt: check ? new Date().toISOString() : null,
    });
  },

  async duplicate(id) {
    const item = await db.todo.get(id);
    if (!item) return false;

    const { id: _, title, ...rest } = item;

    return await db.todo.add({
      ...rest,
      title: title + " (cópia)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
};

// =======================
// CRUD para LIST
// =======================
export const listService = {
  /**
   * Adiciona uma nova LIST
   *
   * Espera um objeto com:
   * {
   *   title: string,
   *   description: string,
   *   history: string[],
   *   tags: number[]
   * }
   * @param {List} list
   */
  async add(list) {
    const safeList = JSON.parse(JSON.stringify(list));
    return await db.list.add({
      ...safeList,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
  /** @returns {Promise<List[]>} */
  async getAll() {
    return await db.list.orderBy("createdAt").reverse().toArray();
  },
  /** @param {number} id @returns {Promise<List|undefined>} */
  async getById(id) {
    return await db.list.get(id);
  },
  /** @param {number} id @param {Partial<List>} changes */
  async update(id, changes) {
    const safeChanges = JSON.parse(JSON.stringify(changes));
    return await db.list.update(id, {
      ...safeChanges,
      updatedAt: new Date().toISOString(),
    });
  },
  /** @param {number} id */
  async remove(id) {
    return await db.list.delete(id);
  },

  async duplicate(id) {
    const item = await db.list.get(id);
    if (!item) return false;

    const { id: _, title, ...rest } = item;

    return await db.list.add({
      ...rest,
      title: title + " (cópia)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
};

// =======================
// CRUD para COUNTER
// =======================
export const counterService = {
  /**
   * Adiciona um novo COUNTER
   *
   * Espera um objeto com:
   * {
   *   title: string,
   *   description: string,
   *   tags: number[],
   *   value: number
   * }
   * @param {Counter} counter
   */
  async add(counter) {
    const safeCounter = JSON.parse(JSON.stringify(counter));
    return await db.counter.add({
      ...safeCounter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
  /** @returns {Promise<Counter[]>} */
  async getAll() {
    return await db.counter.orderBy("createdAt").reverse().toArray();
  },
  /** @param {number} id @returns {Promise<Counter|undefined>} */
  async getById(id) {
    return await db.counter.get(id);
  },
  /** @param {number} id @param {Partial<Counter>} changes */
  async update(id, changes) {
    const safeChanges = JSON.parse(JSON.stringify(changes));
    return await db.counter.update(id, {
      ...safeChanges,
      updatedAt: new Date().toISOString(),
    });
  },
  /** @param {number} id */
  async remove(id) {
    return await db.counter.delete(id);
  },

  /**
   * Incrementa a quantidade de um COUNTER em 1
   * @param {number} id - ID do item
   * @returns {Promise<boolean>}
   */
  async incrementCounter(id) {
    const item = await db.counter.get(id);
    if (!item) return false;
    return await db.counter.update(id, {
      value: item.value + 1,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Decrementa a quantidade de um COUNTER em 1
   * @param {number} id - ID do item
   * @returns {Promise<boolean>}
   */
  async decrementCounter(id) {
    const item = await db.counter.get(id);
    if (!item) return false;
    return await db.counter.update(id, {
      value: item.value - 1,
      updatedAt: new Date().toISOString(),
    });
  },

  async duplicate(id) {
    const item = await db.counter.get(id);
    if (!item) return false;

    const { id: _, title, ...rest } = item;

    return await db.counter.add({
      ...rest,
      title: title + " (cópia)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
};

// =======================
// CRUD para TAGS
// =======================
export const tagService = {
  /**
   * Adiciona uma nova TAG
   *
   * Espera um objeto com:
   * {
   *   name: string,
   *   color: string
   * }
   * Não permite tags com o mesmo nome.
   * @param {Tag} tag
   * @returns {Promise<number>} ID da tag criada
   * @throws {Error} Se já existir uma tag com o mesmo nome
   */
  async add(tag) {
    // verifica se já existe uma tag com esse nome
    const existing = await db.tags
      .where("name")
      .equalsIgnoreCase(tag.name)
      .first();
    if (existing) {
      throw new Error(`TAG com o nome "${tag.name}" já existe.`);
    }

    return await db.tags.add({
      ...tag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
  /** @returns {Promise<Tag[]>} */
  async getAll() {
    return await db.tags.orderBy("createdAt").reverse().toArray();
  },
  /** @param {number} id @returns {Promise<Tag|undefined>} */
  async getById(id) {
    return await db.tags.get(id);
  },
  /** @param {number} id @param {Partial<Tag>} changes */
  async update(id, changes) {
    // Se estiver mudando o nome, verificar duplicidade
    if (changes.name) {
      const existing = await db.tags
        .where("name")
        .equalsIgnoreCase(changes.name)
        .first();
      if (existing && existing.id !== id) {
        throw new Error(`TAG com o nome "${changes.name}" já existe.`);
      }
    }

    return await db.tags.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  },
  /** @param {number} id */
  async remove(id) {
    return await db.tags.delete(id);
  },
};
