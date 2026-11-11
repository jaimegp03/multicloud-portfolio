import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/** Entrada sutil al aparecer en pantalla (solo opacity + transform). */
export function Reveal({ as = 'div', delay = 0, y = 14, className, children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** Cabecera de sección numerada: "01 — Sobre mí" + título + entradilla. */
export function SectionHeader({ index, eyebrow, title, intro }) {
  return (
    <Reveal className="mb-12 grid gap-3 md:mb-16 md:grid-cols-[200px_1fr] md:gap-8">
      <p className="pt-2 font-mono text-xs text-fg-subtle">
        <span className="text-accent-text">{index}</span> — {eyebrow}
      </p>
      <div>
        <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-balance text-fg md:text-[2.75rem] md:leading-[1.08]">
          {title}
        </h2>
        {intro && <p className="mt-4 max-w-2xl text-base text-pretty text-fg-muted md:text-lg">{intro}</p>}
      </div>
    </Reveal>
  )
}

/** Etiqueta de tecnología en monoespaciada. */
export function Tag({ children }) {
  return (
    <span className="rounded-md border border-line bg-bg-elev-2 px-2 py-1 font-mono text-[11px] text-fg-muted">
      {children}
    </span>
  )
}
