import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#stack', label: 'Stack' },
  { href: '#certificaciones', label: 'Certificaciones' },
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#trayectoria', label: 'Trayectoria' },
]

function iniciales(nombre = '') {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
}

export default function Navbar({ nombre }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || open

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300 ${
        solid ? 'border-line bg-bg/85 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <nav aria-label="Principal" className="wrap flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 text-sm font-medium text-fg">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-fg font-mono text-[11px] font-semibold text-bg">
            {iniciales(nombre)}
          </span>
          <span>{nombre}</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a
            href="#contacto"
            className="ml-1 hidden rounded-lg bg-fg px-3.5 py-2 text-sm font-medium text-bg transition-transform active:scale-[0.97] sm:inline-flex"
          >
            Contactar
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="menu-movil"
            className="grid h-9 w-9 place-items-center rounded-lg text-fg hover:bg-bg-elev-2 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <ul id="menu-movil" className="wrap border-t border-line pb-4 pt-2 lg:hidden">
          {[...LINKS, { href: '#contacto', label: 'Contacto' }].map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block border-b border-line py-3 text-base text-fg last:border-0"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
