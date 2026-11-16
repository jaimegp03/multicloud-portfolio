import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leerVisitas, sumarVisita } from '../src/contador.js'

/** Doble en memoria con la interfaz mínima de un container de @azure/cosmos. */
function containerFalso() {
  const docs = new Map()
  const error = (code) => Object.assign(new Error(`HTTP ${code}`), { code })
  return {
    docs,
    item: (id) => ({
      read: async () => ({ resource: docs.get(id), statusCode: docs.has(id) ? 200 : 404 }),
      patch: async (ops) => {
        if (!docs.has(id)) throw error(404)
        const doc = { ...docs.get(id) }
        for (const op of ops) if (op.op === 'incr') doc[op.path.slice(1)] += op.value
        docs.set(id, doc)
        return { resource: doc }
      },
    }),
    items: {
      create: async (doc) => {
        if (docs.has(doc.id)) throw error(409)
        docs.set(doc.id, { ...doc })
        return { resource: doc }
      },
    },
  }
}

test('sin documento, el total es 0', async () => {
  assert.equal(await leerVisitas(containerFalso()), 0)
})

test('la primera visita crea el contador con total 1', async () => {
  const c = containerFalso()
  assert.equal(await sumarVisita(c), 1)
  assert.equal(await leerVisitas(c), 1)
})

test('las visitas siguientes incrementan el total', async () => {
  const c = containerFalso()
  for (let i = 0; i < 4; i++) await sumarVisita(c)
  assert.equal(await leerVisitas(c), 4)
})

test('visitas simultáneas no se pierden', async () => {
  const c = containerFalso()
  await Promise.all(Array.from({ length: 10 }, () => sumarVisita(c)))
  assert.equal(await leerVisitas(c), 10)
})

test('si otra petición crea el documento a la vez (409), se incrementa', async () => {
  const c = containerFalso()
  const crearOriginal = c.items.create
  c.items.create = async (doc) => {
    await crearOriginal({ ...doc }) // "otra petición" lo crea primero
    return crearOriginal(doc) // y esta recibe 409
  }
  assert.equal(await sumarVisita(c), 2)
})

test('los errores que no son 404/409 se propagan', async () => {
  const c = containerFalso()
  c.item = () => ({
    read: async () => {
      throw Object.assign(new Error('boom'), { code: 500 })
    },
  })
  await assert.rejects(() => leerVisitas(c), /boom/)
})
