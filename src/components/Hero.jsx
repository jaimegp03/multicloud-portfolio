import { ArrowUpRight, FileDown, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from './icons/BrandIcons'
import { Reveal } from './ui'
import { btn } from '../lib/utils'

/**
 * Hero: quién soy, qué hago y cómo contactarme, visible al instante
 * (el titular no se anima para no retrasar el primer pintado).
 */
export default function Hero({ meta, certificaciones = [] }) {
  return (
    <section id="top" className="relative -mt-16 overflow-hidden pt-16">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />

      <div className="wrap relative pb-20 pt-16 md:pb-28 md:pt-28">
        <a
          href="#contacto"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-elev px-3 py-1.5 font-mono text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {meta.disponibilidad} · {meta.ubicacion}
        </a>

        <p className="mt-10 font-mono text-sm text-fg-muted">
          {meta.nombre} <span className="text-fg-subtle">/</span> {meta.titulo}
        </p>
        <h1 className="mt-4 max-w-4xl text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.045em] text-balance text-fg sm:text-6xl md:text-7xl lg:text-[5.25rem]">
          {meta.headline}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-pretty text-fg-muted">{meta.tagline}</p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href={`mailto:${meta.email}`} className={btn.primary}>
            <Mail className="h-4 w-4" /> Contactar
          </a>
          <a href={meta.linkedin} target="_blank" rel="noreferrer" className={btn.secondary}>
            <LinkedinIcon className="h-4 w-4" /> LinkedIn
          </a>
          <a href={meta.github} target="_blank" rel="noreferrer" className={btn.secondary}>
            <GithubIcon className="h-4 w-4" /> GitHub
          </a>
          {meta.cv_url && (
            <a href={meta.cv_url} target="_blank" rel="noreferrer" className={btn.secondary}>
              <FileDown className="h-4 w-4" /> CV
            </a>
          )}
        </div>

        {certificaciones.length > 0 && (
          <Reveal delay={0.15} className="mt-20 border-t border-line pt-6">
            <a
              href="#certificaciones"
              className="group flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs"
            >
              <span className="text-fg-subtle">Certificado en</span>
              {certificaciones.map((c) => (
                <span key={c.codigo} className="text-fg transition-colors group-hover:text-fg-muted">
                  {c.codigo}
                </span>
              ))}
              <ArrowUpRight className="h-3.5 w-3.5 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        )}
      </div>
    </section>
  )
}
