import Dexie from 'dexie'

// Criando o banco
const db = new Dexie('ListsDatabase')

db.version(1).stores({
  // Tabela de tarefas (TODO)
  todo: '++id, title, description, createdAt, updatedAt, tags, check, history, type, checkedAt',

  // Tabela de listas simples
  list: '++id, title, description, createdAt, updatedAt, tags, history, type',

  // Tabela de contadores
  counter: '++id, title, description, createdAt, updatedAt, tags, value, type',

  // Tabela de marcadores
  tags: '++id, name, color, createdAt, updatedAt'
})

/**
 * Tipagem (comentários):
 *
 * Table: todo
 * - id: number (auto increment)
 * - title: string
 * - description: string
 * - createdAt: Date
 * - updatedAt: Date
 * - history: string[] (histórico de descrições)
 * - tags: number[] (ids dos marcadores)
 * - check: boolean (foi concluído ou não)
 * - checkedAt: Date
 *
 * Table: list
 * - id: number (auto increment)
 * - title: string
 * - description: string
 * - createdAt: Date
 * - updatedAt: Date
 * - history: string[]
 * - tags: number[] (ids dos marcadores)
 *
 * Table: counter
 * - id: number (auto increment)
 * - title: string
 * - description: string
 * - createdAt: Date
 * - updatedAt: Date
 * - history: string[]
 * - tags: number[] (ids dos marcadores)
 * - value: number
 *
 * Table: tags
 * - id: number (auto increment)
 * - name: string
 * - color: string (ex: '#ff0000' ou 'red')
 * - createdAt: Date
 * - updatedAt: Date
 */

export default db
