import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

function temaActual() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

/** Alterna tema claro/oscuro y lo recuerda en este navegador. */
export default function ThemeToggle() {
  const [tema, setTema] = useState(temaActual)

  const alternar = () => {
    const siguiente = tema === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = siguiente
    try {
      localStorage.setItem('tema', siguiente)
    } catch {
      /* almacenamiento no disponible: el tema solo dura esta visita */
    }
    setTema(siguiente)
  }

  const Icono = tema === 'dark' ? Sun : Moon
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className="grid h-9 w-9 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-bg-elev-2 hover:text-fg"
    >
      <Icono className="h-4 w-4" />
    </button>
  )
}
