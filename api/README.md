# API serverless de visitas

Contador de visitas del portfolio servido por una API propia en Azure, **sin servidores que administrar y sin una sola contraseña** en el código ni en GitHub.

```
Navegador ──HTTPS──▶ Azure Functions ──Entra ID──▶ Cosmos DB
 (portfolio)        (Flex Consumption)  (identidad     (serverless)
                            │            administrada)
                            └──────────▶ Application Insights + Log Analytics
```

## En qué consiste

- La web llama a `POST /api/visitas` una vez por sesión del navegador (suma 1 y devuelve el total) y a `GET /api/visitas` el resto de veces (solo consulta).
- **Azure Functions** ejecuta el código solo cuando llega una petición: si nadie visita la web, no hay nada encendido ni se paga nada.
- **Cosmos DB** guarda un único documento `{ id: "portfolio", total: N }`. El incremento usa la operación atómica `patch incr`: aunque lleguen muchas visitas a la vez, ninguna se pierde.
- **Identidad administrada**: la Function App tiene una identidad en Entra ID con permiso solo para leer y escribir datos en esa base de datos. Cosmos DB tiene el acceso por clave **desactivado**, así que no existe ninguna clave que se pueda filtrar.
- **Application Insights** registra cada petición, su duración y los errores.

## Para qué sirve en el mundo real

El contador es la excusa; el patrón es lo que usan las empresas a diario:

| Lo que hace aquí | Dónde se usa igual en una empresa |
|---|---|
| Función HTTP que escala a cero | Webhooks, formularios de contacto, backends de apps móviles, procesos que se ejecutan de vez en cuando |
| Base de datos NoSQL serverless | Catálogos, carritos, perfiles de usuario, telemetría de dispositivos |
| Identidad administrada en lugar de claves | Es la recomendación de Microsoft y un requisito habitual de auditorías de seguridad (ISO 27001, ENS) |
| Incremento atómico | Contadores de stock, likes, cuotas de uso: cualquier dato que muchos usuarios modifican a la vez |
| Monitorización con App Insights | Saber si una API está lenta o falla antes de que se quejen los usuarios |
| Todo en Terraform + CI/CD | Poder recrear el entorno idéntico en otra región o suscripción en minutos |

## Cómo está montado

1. **Infraestructura** (`terraform/azure-api/`), en su propio resource group:
   - Log Analytics (con tope diario de ingesta) + Application Insights.
   - Cosmos DB serverless, base de datos `portfolio`, contenedor `contadores`.
   - Function App en plan **Flex Consumption** (Node 22), con su cuenta de almacenamiento también sin claves.
   - Roles: la función recibe *Cosmos DB Built-in Data Contributor* y los roles de datos de su almacenamiento; la identidad OIDC de GitHub recibe *Website Contributor* solo sobre esta Function App.
   - CORS: solo el dominio del portfolio y `localhost` pueden llamar a la API desde el navegador.
2. **Código** (`api/`):
   - `src/contador.js`: la lógica, sin dependencias de Azure.
   - `src/functions/visitas.js`: el endpoint HTTP que conecta esa lógica con Cosmos DB.
   - `test/`: pruebas con un doble en memoria de Cosmos DB (incluida la concurrencia).
3. **CI/CD** (`.github/workflows/deploy-api.yml`): pruebas → login OIDC → despliegue → prueba de humo contra la URL real.

## Coste

Prácticamente 0 €: Flex Consumption incluye una cuota gratuita mensual, Cosmos DB serverless cobra por operación (céntimos con este tráfico) y Log Analytics tiene un tope de 0,5 GB/día.

## Desarrollo

```bash
npm install
npm test
```
