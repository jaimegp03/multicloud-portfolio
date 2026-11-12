import { useState } from 'react'
import { ArrowUp, Check, Copy, FileDown, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from './icons/BrandIcons'
import { Reveal } from './ui'
import { btn } from '../lib/utils'

export default function Contact({ meta }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(meta.email)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin acceso al portapapeles: se muestra el email para copiarlo a mano
      window.prompt('Copia mi email:', meta.email)
    }
  }

  // mailto: solo funciona si el equipo tiene una app de correo configurada;
  // estos enlaces abren directamente el correo web.
  const asunto = encodeURIComponent('Contacto desde tu portfolio')
  const webmail = [
    { nombre: 'Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${meta.email}&su=${asunto}` },
    { nombre: 'Outlook', href: `https://outlook.office.com/mail/deeplink/compose?to=${meta.email}&subject=${asunto}` },
  ]

  return (
    <footer id="contacto" className="border-t border-line">
      <div className="wrap py-24 md:py-36">
        <p className="font-mono text-xs text-fg-subtle">
          <span className="text-accent-text">06</span> — Contacto
        </p>
        <Reveal as="h2" className="mt-6 text-5xl font-semibold tracking-[-0.045em] text-fg md:text-8xl">
          ¿Hablamos?
        </Reveal>
        <p className="mt-6 max-w-xl text-lg text-pretty text-fg-muted">
          {meta.disponibilidad} en cloud, DevOps y seguridad. Escríbeme y te respondo personalmente.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${meta.email}`}
            className="break-all text-xl font-medium text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-accent-text md:text-3xl"
          >
            {meta.email}
          </a>
          <button
            type="button"
            onClick={copiar}
            aria-label={copiado ? 'Email copiado' : 'Copiar email'}
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            {copiado ? <Check className="h-4 w-4 text-accent-text" /> : <Copy className="h-4 w-4" />}
          </button>
          <span role="status" className="font-mono text-xs text-accent-text">
            {copiado ? 'Copiado' : ''}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {webmail.map((w, i) => (
            <a
              key={w.nombre}
              href={w.href}
              target="_blank"
              rel="noreferrer"
              className={i === 0 ? btn.primary : btn.secondary}
            >
              <Mail className="h-4 w-4" /> Contactar por {w.nombre}
            </a>
          ))}
          <a href={`mailto:${meta.email}`} className={btn.secondary}>
            <Mail className="h-4 w-4" /> Contactar por app de correo
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href={meta.linkedin} target="_blank" rel="noreferrer" className={btn.secondary}>
            <LinkedinIcon className="h-4 w-4" /> LinkedIn
          </a>
          <a href={meta.github} target="_blank" rel="noreferrer" className={btn.secondary}>
            <GithubIcon className="h-4 w-4" /> GitHub
          </a>
          {meta.cv_url && (
            <a href={meta.cv_url} target="_blank" rel="noreferrer" className={btn.secondary}>
              <FileDown className="h-4 w-4" /> CV (versión pública)
            </a>
          )}
        </div>
        {meta.cv_url && (
          <p className="mt-4 max-w-xl text-sm text-fg-subtle">
            Es una versión pública, sin teléfono ni dirección. Si necesitas el CV completo, pídemelo por email.
          </p>
        )}
      </div>

      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-3 py-6 font-mono text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {meta.nombre}
          </p>
          <p>React · Docker · Terraform · GitHub Actions</p>
          <a href="#top" className="inline-flex items-center gap-1.5 hover:text-fg">
            Volver arriba <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
