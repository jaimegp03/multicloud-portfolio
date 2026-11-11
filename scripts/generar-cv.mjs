// Genera public/cv-jaime-gomez-pascual.pdf a partir de src/data/perfil.json.
// Uso: npm run cv   (necesita Google Chrome o Microsoft Edge instalado; ruta propia con CHROME_PATH)
// Versión pública del CV: solo email, LinkedIn y GitHub, sin teléfono ni dirección postal.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = resolve(import.meta.dirname, '..')
const perfil = JSON.parse(readFileSync(join(raiz, 'src/data/perfil.json'), 'utf8'))
const salida = join(raiz, 'public', perfil.meta.cv_url?.replace(/^\//, '') || 'cv.pdf')

const esc = (s = '') =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const MESES = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.']
const fecha = (v) => {
  const m = /^(\d{4})-(\d{2})$/.exec(v ?? '')
  return m ? `${MESES[Number(m[2]) - 1]} ${m[1]}` : esc(v)
}
const sinProtocolo = (u = '') => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

const { meta, sobre_mi, stack, experiencia, formacion, certificaciones, proyectos, idiomas } = perfil

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>CV · ${esc(meta.nombre)}</title>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=block" rel="stylesheet">
<style>
@page { size: A4; margin: 11mm 13mm; }
* { box-sizing: border-box; }
body { margin: 0; font: 9pt/1.42 Geist, system-ui, sans-serif; color: #15171a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.mono { font-family: 'Geist Mono', ui-monospace, monospace; }
header { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 11px; border-bottom: 1.5px solid #15171a; }
h1 { margin: 0; font-size: 22pt; line-height: 1.05; letter-spacing: -0.03em; font-weight: 600; }
.rol { margin: 6px 0 0; font-size: 11pt; color: #3f444b; }
.contacto { text-align: right; font-size: 8.4pt; line-height: 1.7; color: #3f444b; white-space: nowrap; }
.contacto a { color: inherit; text-decoration: none; }
.tag { display: inline-block; margin-top: 10px; padding: 2px 8px; border-radius: 99px; background: #c8f560; color: #15171a; font-size: 7.8pt; font-weight: 500; }
section { display: grid; grid-template-columns: 104px 1fr; gap: 14px; padding: 8px 0; border-bottom: 0.75px solid #dcdcd6; break-inside: avoid; }
section:last-child { border-bottom: 0; }
h2 { margin: 0; font: 500 7.8pt/1.6 'Geist Mono', monospace; text-transform: uppercase; letter-spacing: 0.08em; color: #5f646c; }
p { margin: 0; }
.item + .item { margin-top: 6px; }
.cab { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
.cab b { font-weight: 600; font-size: 10pt; }
.cab .mono { font-size: 8pt; color: #5f646c; white-space: nowrap; }
.sub { color: #4b5058; font-size: 8.8pt; }
ul { margin: 3px 0 0; padding-left: 14px; }
li { margin: 1px 0; }
.certs { display: grid; grid-template-columns: 62px 1fr auto; gap: 3px 12px; align-items: baseline; }
.certs .mono { font-size: 8pt; }
.certs .f { color: #5f646c; }
.stack { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 18px; margin: 0; }
.stack dt { display: inline; font-weight: 500; }
.stack dt::after { content: ': '; }
.stack dd { display: inline; margin: 0; color: #3f444b; }
.pie { margin-top: 3px; font-size: 7.6pt; color: #7a7f87; }
</style></head><body>
<header>
  <div>
    <h1>${esc(meta.nombre)}</h1>
    <p class="rol">${esc(meta.titulo)}</p>
    <span class="tag">${esc(meta.disponibilidad)}</span>
  </div>
  <div class="contacto mono">
    <a href="mailto:${esc(meta.email)}">${esc(meta.email)}</a><br>
    <a href="${esc(meta.linkedin)}">${esc(sinProtocolo(meta.linkedin))}</a><br>
    <a href="${esc(meta.github)}">${esc(sinProtocolo(meta.github))}</a><br>
    ${meta.web ? `<a href="${esc(meta.web)}">${esc(sinProtocolo(meta.web))}</a><br>` : ''}
    ${esc(meta.ubicacion)}
  </div>
</header>

<section><h2>Perfil</h2><p>${esc(sobre_mi.resumen)}</p></section>

<section><h2>Certificaciones</h2><div class="certs">
${certificaciones
  .map(
    (c) =>
      `<span class="mono">${esc(c.codigo)}</span><span>${esc(c.nombre)} <span class="sub">· ${esc(c.entidad)}</span></span><span class="mono f">${esc(c.fecha)}</span>`,
  )
  .join('\n')}
</div></section>

<section><h2>Experiencia</h2><div>
${experiencia
  .map(
    (e) => `<div class="item">
  <div class="cab"><b>${esc(e.puesto)}</b><span class="mono">${fecha(e.fecha_inicio)} — ${fecha(e.fecha_fin)}</span></div>
  <p class="sub">${esc(e.empresa)}${e.tipo_empleo ? ` · ${esc(e.tipo_empleo)}` : ''}</p>
  <ul>${(e.logros ?? []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
</div>`,
  )
  .join('\n')}
</div></section>

<section><h2>Formación</h2><div>
${formacion
  .map(
    (f) => `<div class="item"><div class="cab"><b>${esc(f.titulo)}</b><span class="mono">${fecha(f.fecha_inicio)} — ${fecha(f.fecha_fin)}</span></div><p class="sub">${esc(f.institucion)}</p></div>`,
  )
  .join('\n')}
</div></section>

<section><h2>Stack</h2><dl class="stack">
${stack.map((c) => `<div><dt>${esc(c.titulo)}</dt><dd>${c.tecnologias.map((t) => esc(t.nombre)).join(' · ')}</dd></div>`).join('\n')}
</dl></section>

${
  proyectos?.length
    ? `<section><h2>Proyectos</h2><div>
${proyectos
  .map(
    (p) => `<div class="item"><b>${esc(p.nombre)}</b><p class="sub">${esc(p.solucion ?? p.descripcion)}</p><p class="pie mono">${esc((p.tecnologias ?? []).join(' · '))}</p></div>`,
  )
  .join('\n')}
</div></section>`
    : ''
}

<section><h2>Idiomas</h2><div><p>${idiomas.map((l) => `${esc(l.idioma)} <span class="sub">(${esc(l.nivel)})</span>`).join(' · ')}</p>
${sobre_mi.capacidades?.length ? `<p class="pie">${sobre_mi.capacidades.map(esc).join(' · ')}</p>` : ''}</div></section>
</body></html>`

function buscarNavegador() {
  const candidatos = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean)
  const ruta = candidatos.find((c) => existsSync(c))
  if (!ruta) throw new Error('No encuentro Chrome/Edge. Indica su ruta con CHROME_PATH.')
  return ruta
}

const dir = mkdtempSync(join(tmpdir(), 'cv-'))
try {
  const htmlPath = join(dir, 'cv.html')
  writeFileSync(htmlPath, html)
  execFileSync(buscarNavegador(), [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--user-data-dir=${join(dir, 'perfil')}`,
    '--virtual-time-budget=8000',
    `--print-to-pdf=${salida}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: 'ignore' })
  console.log(`CV generado: ${salida}`)
} finally {
  rmSync(dir, { recursive: true, force: true })
}
