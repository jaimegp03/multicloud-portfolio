import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeader } from './ui'

function emisor(cert) {
  if (/aws/i.test(cert.entidad)) return 'AWS'
  if (/github/i.test(`${cert.entidad} ${cert.nombre}`)) return 'GitHub'
  return 'Microsoft'
}

function Detalles({ cert }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-xs">
      <dt className="text-fg-subtle">Emisor</dt>
      <dd className="text-fg-muted">{cert.entidad}</dd>
      <dt className="text-fg-subtle">Obtenida</dt>
      <dd className="text-fg-muted">{cert.fecha}</dd>
      {cert.vencimiento && (
        <>
          <dt className="text-fg-subtle">Válida hasta</dt>
          <dd className="text-fg-muted">{cert.vencimiento}</dd>
        </>
      )}
      {cert.credencial_id && (
        <>
          <dt className="text-fg-subtle">ID</dt>
          <dd className="break-all text-fg-muted">{cert.credencial_id}</dd>
        </>
      )}
    </dl>
  )
}

/**
 * Lista con vista previa: al pasar el ratón (o enfocar) una fila,
 * se expande y la tarjeta lateral muestra esa certificación.
 */
export default function Certifications({ certificaciones = [] }) {
  const [active, setActive] = useState(0)
  if (!certificaciones.length) return null
  const cert = certificaciones[active]

  return (
    <section id="certificaciones" className="border-t border-line py-24 md:py-32">
      <div className="wrap">
        <SectionHeader
          index="03"
          eyebrow="Certificaciones"
          title="Validado por AWS, Microsoft y GitHub."
          intro={`${certificaciones.length} certificaciones oficiales que respaldan el stack: arquitectura en AWS, administración y seguridad en Azure, y CI/CD.`}
        />

        <div className="grid gap-10 md:grid-cols-[200px_1fr] md:gap-8">
          <div aria-hidden="true" />
          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
            <ul className="border-t border-line">
              {certificaciones.map((c, i) => {
                const on = i === active
                return (
                  <li key={c.codigo} className="border-b border-line">
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-expanded={on}
                      className="group w-full py-5 text-left"
                    >
                      <span className="grid grid-cols-[72px_1fr] items-baseline gap-4 sm:grid-cols-[88px_1fr_auto]">
                        <span
                          className={`font-mono text-xs transition-colors ${on ? 'text-accent-text' : 'text-fg-subtle'}`}
                        >
                          {c.codigo}
                        </span>
                        <span
                          className={`text-base transition-colors md:text-lg ${on ? 'text-fg' : 'text-fg-muted group-hover:text-fg'}`}
                        >
                          {c.nombre}
                        </span>
                        <span className="hidden font-mono text-xs text-fg-subtle sm:block">{c.fecha}</span>
                      </span>
                      <span
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <span className="overflow-hidden">
                          <span className="block pl-[88px] pt-4 sm:pl-[104px] lg:hidden">
                            <Detalles cert={c} />
                          </span>
                          <span className="hidden pl-[104px] pt-2 font-mono text-xs text-fg-subtle lg:block">
                            {c.entidad}
                            {c.vencimiento && ` · válida hasta ${c.vencimiento}`}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <aside aria-live="polite" className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-line bg-bg-elev p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-line px-2 py-1 font-mono text-[11px] text-fg-muted">
                    {emisor(cert)}
                  </span>
                  <span className="font-mono text-[11px] text-fg-subtle">
                    {String(active + 1).padStart(2, '0')} / {String(certificaciones.length).padStart(2, '0')}
                  </span>
                </div>
                <p key={cert.codigo} className="mt-10 font-mono text-5xl font-medium tracking-tight text-fg">
                  {cert.codigo}
                </p>
                <p className="mt-3 text-sm text-fg-muted">{cert.nombre}</p>
                <div className="mt-8 border-t border-line pt-5">
                  <Detalles cert={cert} />
                </div>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent-text hover:underline"
                  >
                    Verificar credencial <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
