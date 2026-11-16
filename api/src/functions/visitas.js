import { app } from '@azure/functions'
import { CosmosClient } from '@azure/cosmos'
import { DefaultAzureCredential } from '@azure/identity'
import { leerVisitas, sumarVisita } from '../contador.js'

// Sin claves: la identidad administrada de la Function App se autentica
// en Cosmos DB con Entra ID (el acceso por clave está desactivado).
const cliente = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  aadCredentials: new DefaultAzureCredential(),
})
const container = cliente.database(process.env.COSMOS_DATABASE).container(process.env.COSMOS_CONTAINER)

const SIN_CACHE = { 'Cache-Control': 'no-store' }

app.http('visitas', {
  route: 'visitas',
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      // GET consulta el total; POST registra una visita y devuelve el nuevo total
      const total = request.method === 'POST' ? await sumarVisita(container) : await leerVisitas(container)
      return { jsonBody: { visitas: total }, headers: SIN_CACHE }
    } catch (error) {
      context.error('Error en el contador de visitas', error)
      return { status: 503, jsonBody: { error: 'Contador no disponible' }, headers: SIN_CACHE }
    }
  },
})
