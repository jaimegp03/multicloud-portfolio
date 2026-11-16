import { useEffect, useState } from 'react'

const CLAVE_SESION = 'visita-registrada'

/**
 * Contador de visitas servido por la API serverless (api/).
 * Registra una visita por sesión del navegador (POST) y el resto de veces
 * solo consulta (GET). Si la API no responde, no se muestra nada.
 */
export default function ContadorVisitas({ url }) {
  const [visitas, setVisitas] = useState(null)

  useEffect(() => {
    if (!url) return
    const control = new AbortController()
    const limite = setTimeout(() => control.abort(), 5000)

    let yaRegistrada = false
    try {
      yaRegistrada = sessionStorage.getItem(CLAVE_SESION) === '1'
    } catch {
      // Sin sessionStorage (modo privado estricto): se cuenta como visita
    }

    fetch(url, { method: yaRegistrada ? 'GET' : 'POST', signal: control.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(({ visitas }) => {
        if (!Number.isFinite(visitas)) return
        setVisitas(visitas)
        try {
          sessionStorage.setItem(CLAVE_SESION, '1')
        } catch {
          /* sin persistencia */
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(limite))

    return () => {
      clearTimeout(limite)
      control.abort()
    }
  }, [url])

  if (visitas === null) return null

  return (
    <p title="Contador servido por una API serverless en Azure Functions + Cosmos DB">
      <span className="text-accent-text">●</span> {visitas.toLocaleString('es-ES')} visitas · API en Azure Functions
    </p>
  )
}
