import { ArrowUpRight } from 'lucide-react'
import { GithubIcon } from './icons/BrandIcons'
import { Reveal, SectionHeader, Tag } from './ui'

function Pipeline({ pasos }) {
  return (
    <ol className="relative w-full">
      {pasos.map((p, i) => (
        <li key={p.paso} className="relative flex gap-4 pb-7 last:pb-0">
          {i < pasos.length - 1 && (
            <span aria-hidden="true" className="absolute left-[7px] top-5 h-full w-px bg-line-strong" />
          )}
          <span
            aria-hidden="true"
            className="relative mt-1 grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border border-line-strong bg-bg-elev"
          >
            <span className="h-[5px] w-[5px] rounded-full bg-accent-text" />
          </span>
          <div>
            <p className="font-mono text-sm text-fg">{p.paso}</p>
            <p className="mt-0.5 font-mono text-xs text-fg-subtle">{p.detalle}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function Projects({ proyectos = [] }) {
  if (!proyectos.length) return null

  return (
    <section id="proyectos" className="border-t border-line py-24 md:py-32">
      <div className="wrap">
        <SectionHeader
          index="04"
          eyebrow="Proyectos"
          title="Lo construyo, lo automatizo y lo despliego."
          intro="Proyectos explicados como casos: el problema, la solución y el pipeline que lo pone en producción."
        />

        <div className="space-y-8">
          {proyectos.map((p) => (
            <Reveal
              as="article"
              key={p.nombre}
              className="grid overflow-hidden rounded-2xl border border-line bg-bg-elev lg:grid-cols-[1.35fr_1fr]"
            >
              <div className="p-6 md:p-10">
                <p className="font-mono text-xs text-fg-subtle">{p.tipo}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-fg md:text-3xl">{p.nombre}</h3>

                <dl className="mt-8 space-y-5 text-sm">
                  {p.problema && (
                    <div>
                      <dt className="font-mono text-xs text-fg-subtle">Problema</dt>
                      <dd className="mt-1.5 text-pretty text-fg-muted">{p.problema}</dd>
                    </div>
                  )}
                  {p.solucion && (
                    <div>
                      <dt className="font-mono text-xs text-fg-subtle">Solución</dt>
                      <dd className="mt-1.5 text-pretty text-fg">{p.solucion}</dd>
                    </div>
                  )}
                </dl>

                {p.destacados?.length > 0 && (
                  <ul className="mt-6 space-y-2 text-sm text-fg-muted">
                    {p.destacados.map((d) => (
                      <li key={d} className="flex gap-3">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-text" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}

                {p.tecnologias?.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {p.tecnologias.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                )}

                {(p.repo_url || p.demo_url) && (
                  <div className="mt-8 flex flex-wrap gap-5 text-sm">
                    {p.repo_url && (
                      <a
                        href={p.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-fg hover:text-accent-text"
                      >
                        <GithubIcon className="h-4 w-4" /> Código
                      </a>
                    )}
                    {p.demo_url && (
                      <a
                        href={p.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-fg hover:text-accent-text"
                      >
                        Ver demo <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {p.pipeline?.length > 0 && (
                <div className="flex flex-col justify-center gap-6 border-t border-line bg-bg-elev-2 p-6 md:p-10 lg:border-l lg:border-t-0">
                  <p className="font-mono text-xs text-fg-subtle">Pipeline de despliegue</p>
                  <Pipeline pasos={p.pipeline} />
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
