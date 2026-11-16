// Lógica del contador, independiente de Azure: recibe un "container"
// con la misma interfaz que el de @azure/cosmos, así se puede probar
// con un doble en memoria (test/contador.test.js).

export const ID_CONTADOR = 'portfolio'

const esNoEncontrado = (e) => e?.code === 404 || e?.statusCode === 404
const esConflicto = (e) => e?.code === 409 || e?.statusCode === 409

/** Devuelve el total de visitas (0 si el contador aún no existe). */
export async function leerVisitas(container, id = ID_CONTADOR) {
  try {
    const { resource } = await container.item(id, id).read()
    return resource?.total ?? 0
  } catch (e) {
    if (esNoEncontrado(e)) return 0
    throw e
  }
}

/**
 * Suma una visita de forma atómica (operación patch "incr" de Cosmos DB:
 * dos visitas simultáneas nunca se pisan) y devuelve el nuevo total.
 * La primera vez crea el documento.
 */
export async function sumarVisita(container, id = ID_CONTADOR) {
  const incrementar = async () => {
    const { resource } = await container.item(id, id).patch([{ op: 'incr', path: '/total', value: 1 }])
    return resource.total
  }

  try {
    return await incrementar()
  } catch (e) {
    if (!esNoEncontrado(e)) throw e
  }

  try {
    const { resource } = await container.items.create({ id, total: 1 })
    return resource.total
  } catch (e) {
    // Otra petición lo creó a la vez: basta con incrementar
    if (esConflicto(e)) return incrementar()
    throw e
  }
}
