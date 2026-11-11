import { Reveal, SectionHeader, Tag } from './ui'
import { formatFecha } from '../lib/utils'

function Fila({ fechas, children }) {
  return (
    <Reveal as="li" className="grid gap-3 border-t border-line py-8 md:grid-cols-[200px_1fr] md:gap-8">
      <p className="font-mono text-xs text-fg-subtle md:pt-1.5">{fechas}</p>
      <div>{children}</div>
    </Reveal>
  )
}

export default function Trajectory({ experiencia = [], formacion = [] }) {
  if (!experiencia.length && !formacion.length) return null

  return (
    <section id="trayectoria" className="border-t border-line py-24 md:py-32">
      <div className="wrap">
        <SectionHeader index="05" eyebrow="Trayectoria" title="Experiencia y formación." />

        {experiencia.length > 0 && (
          <div id="experiencia">
            <h3 className="mb-2 font-mono text-xs text-fg-subtle">Experiencia</h3>
            <ol className="border-b border-line">
              {experiencia.map((exp) => (
                <Fila
                  key={`${exp.empresa}-${exp.fecha_inicio}`}
                  fechas={`${formatFecha(exp.fecha_inicio)} — ${formatFecha(exp.fecha_fin)}`}
                >
                  <h4 className="text-xl font-semibold tracking-[-0.02em] text-fg">{exp.puesto}</h4>
                  <p className="mt-1 text-sm text-fg-muted">
                    {exp.empresa}
                    {exp.tipo_empleo && ` · ${exp.tipo_empleo}`}
                  </p>
                  <p className="mt-4 max-w-2xl text-pretty text-fg-muted">{exp.descripcion}</p>
                  {exp.logros?.length > 0 && (
                    <ul className="mt-5 max-w-2xl space-y-2.5 text-sm text-fg">
                      {exp.logros.map((l) => (
                        <li key={l} className="flex gap-3">
                          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-text" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.tecnologias?.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {exp.tecnologias.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  )}
                </Fila>
              ))}
            </ol>
          </div>
        )}

        {formacion.length > 0 && (
          <div id="formacion" className="mt-20">
            <h3 className="mb-2 font-mono text-xs text-fg-subtle">Formación</h3>
            <ol className="border-b border-line">
              {formacion.map((f) => (
                <Fila key={f.titulo} fechas={`${formatFecha(f.fecha_inicio)} — ${formatFecha(f.fecha_fin)}`}>
                  <h4 className="text-lg font-medium text-pretty text-fg">{f.titulo}</h4>
                  <p className="mt-1 text-sm text-fg-muted">{f.institucion}</p>
                </Fila>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}
