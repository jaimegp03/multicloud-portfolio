import { useEffect, useRef, useState } from 'react'
import ArchitectureDiagram from './ArchitectureDiagram'
import { SectionHeader } from './ui'

/**
 * Escena sticky: el diagrama queda fijo mientras los capítulos
 * numerados pasan al lado; el capítulo centrado en pantalla
 * enciende su capa del diagrama.
 */
export default function StackScene({ stack = [] }) {
  const [active, setActive] = useState(stack[0]?.id)
  const refs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.dataset.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [stack])

  if (!stack.length) return null
  const total = String(stack.length).padStart(2, '0')

  return (
    <section id="stack" className="border-t border-line py-24 md:py-32">
      <div className="wrap">
        <SectionHeader
          index="02"
          eyebrow="Stack"
          title="Cómo encajan las piezas."
          intro="Cada capa del diagrama es una parte del stack con la que trabajo. Al hacer scroll se ilumina la que estás leyendo."
        />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="sticky top-16 z-10 -mx-5 border-b border-line bg-bg/90 px-5 py-4 backdrop-blur-md md:-mx-8 md:px-8 lg:top-16 lg:mx-0 lg:flex lg:h-[calc(100vh-4rem)] lg:items-center lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <figure className="m-0 w-full">
              <ArchitectureDiagram active={active} />
              <figcaption className="mt-3 flex items-center gap-2 font-mono text-[11px] text-fg-subtle lg:mt-5 lg:text-xs">
                <span className="shrink-0 whitespace-nowrap rounded border border-line px-1.5 py-0.5 text-fg-muted">Arquitectura de referencia</span>
                <span className="hidden sm:inline">Ilustra cómo encajan las áreas del stack, no un proyecto concreto.</span>
              </figcaption>
            </figure>
          </div>

          <ol>
            {stack.map((cat, i) => {
              const on = active === cat.id
              return (
                <li
                  key={cat.id}
                  ref={(el) => (refs.current[i] = el)}
                  data-id={cat.id}
                  className="flex min-h-[60vh] flex-col justify-center border-t border-line py-12 first:border-t-0 lg:min-h-[75vh]"
                >
                  <p className="font-mono text-xs text-fg-subtle">
                    <span className={on ? 'text-accent-text' : ''}>{String(i + 1).padStart(2, '0')}</span> / {total}
                  </p>
                  <h3
                    className={`mt-3 text-2xl font-semibold tracking-[-0.02em] transition-colors duration-500 md:text-3xl ${
                      on ? 'text-fg' : 'text-fg-muted'
                    }`}
                  >
                    {cat.titulo}
                  </h3>
                  <p className="mt-3 max-w-md text-pretty text-fg-muted">{cat.resumen}</p>
                  <dl className="mt-8 divide-y divide-line border-y border-line">
                    {cat.tecnologias.map((t) => (
                      <div key={t.nombre} className="grid grid-cols-[120px_1fr] gap-4 py-3.5 text-sm">
                        <dt className="font-mono text-fg">{t.nombre}</dt>
                        <dd className="text-fg-muted">{t.detalle}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
