import { Reveal, SectionHeader } from './ui'

export default function About({ sobreMi, idiomas = [] }) {
  if (!sobreMi) return null

  return (
    <section id="sobre-mi" className="border-t border-line py-24 md:py-32">
      <div className="wrap">
        <SectionHeader index="01" eyebrow="Sobre mí" title="Tecnología al servicio de problemas reales." />

        <div className="grid gap-12 md:grid-cols-[200px_1fr] md:gap-8">
          <div aria-hidden="true" />
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <Reveal as="p" className="text-lg leading-relaxed text-pretty text-fg md:text-xl md:leading-relaxed">
              {sobreMi.resumen}
            </Reveal>

            <Reveal delay={0.1} className="space-y-10">
              {sobreMi.highlights?.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs text-fg-subtle">Puntos clave</h3>
                  <ul className="mt-4 divide-y divide-line border-y border-line">
                    {sobreMi.highlights.map((item) => (
                      <li key={item} className="flex gap-3 py-3 text-sm text-fg-muted">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-text" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {idiomas.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs text-fg-subtle">Idiomas</h3>
                  <dl className="mt-4 flex gap-8 text-sm">
                    {idiomas.map((l) => (
                      <div key={l.idioma}>
                        <dt className="text-fg">{l.idioma}</dt>
                        <dd className="font-mono text-xs text-fg-muted">{l.nivel}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {sobreMi.capacidades?.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs text-fg-subtle">Cómo trabajo</h3>
                  <p className="mt-4 text-sm leading-relaxed text-fg-muted">
                    {sobreMi.capacidades.join(' · ')}
                  </p>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
