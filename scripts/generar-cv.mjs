// Genera la VERSIÓN PÚBLICA del CV (public/cv-jaime-gomez-pascual.pdf) a partir de src/data/perfil.json.
// Uso: npm run cv   (necesita Google Chrome o Microsoft Edge; ruta propia con CHROME_PATH)
// Sin teléfono ni dirección postal: el CV completo se envía a petición.
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
const corta = (u = '') => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
const lista = (arr, fn) => (arr ?? []).map(fn).join('')

const { meta, sobre_mi, stack, experiencia, formacion, certificaciones, proyectos, idiomas } = perfil

// Iconos de línea mínimos (contacto)
const ICON = {
  mail: '<path d="M3 5h18v14H3z"/><path d="m3 6 9 7 9-7"/>',
  in: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  gh: '<path d="M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5a3 3 0 0 0-1-2.5c3 0 6-1.5 6-6.5a5 5 0 0 0-1.5-3.5 4.5 4.5 0 0 0-.1-3.5s-1.2-.4-3.9 1.5a13 13 0 0 0-7 0C6.8 1.6 5.6 2 5.6 2a4.5 4.5 0 0 0-.1 3.5A5 5 0 0 0 4 9c0 5 3 6.5 6 6.5a3 3 0 0 0-1 2.5V22"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
}
const icono = (k) =>
  `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`

const contacto = [
  ['mail', meta.email, `mailto:${meta.email}`],
  ['in', corta(meta.linkedin), meta.linkedin],
  ['gh', corta(meta.github), meta.github],
  meta.web && ['web', corta(meta.web), meta.web],
  ['pin', meta.ubicacion],
].filter(Boolean)

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>CV · ${esc(meta.nombre)} (versión pública)</title>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=block" rel="stylesheet">
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
:root { --ink: #121417; --muted: #555b64; --soft: #80858d; --line: #e3e3dd; --side: #f4f4f0; --lime: #c8f560; --olive: #3f6212; }
html, body { margin: 0; }
body { width: 210mm; height: 297mm; font: 8.7pt/1.45 Geist, system-ui, sans-serif; color: var(--ink);
  -webkit-print-color-adjust: exact; print-color-adjust: exact; display: flex; flex-direction: column; }
.mono { font-family: 'Geist Mono', ui-monospace, monospace; }
a { color: inherit; text-decoration: none; }

/* Cabecera oscura, como el portfolio */
header { background: #0b0c0e; color: #f2f2f0; padding: 13mm 14mm 10mm; display: flex; justify-content: space-between; align-items: flex-end; gap: 10mm; }
.pill { display: inline-flex; align-items: center; gap: 6px; font: 500 7pt 'Geist Mono', monospace; color: #a1a7b0; border: 1px solid #2a2d33; border-radius: 99px; padding: 2.5px 9px; }
.pill i { width: 6px; height: 6px; border-radius: 6px; background: var(--lime); }
h1 { margin: 9px 0 0; font-size: 27pt; line-height: 1; letter-spacing: -0.04em; font-weight: 600; }
.rol { margin: 6px 0 0; font-size: 10.5pt; color: #c9cdd3; }
.contacto { list-style: none; margin: 0; padding: 0; font: 7.6pt/1.9 'Geist Mono', monospace; color: #c9cdd3; text-align: right; }
.contacto li { display: flex; justify-content: flex-end; align-items: center; gap: 7px; }
.contacto svg { color: var(--lime); flex: none; }

/* Cuerpo a dos columnas */
.cuerpo { flex: 1; display: grid; grid-template-columns: 64mm 1fr; }
aside { background: var(--side); padding: 8mm 7mm 8mm 14mm; border-right: 1px solid var(--line); }
main { padding: 8mm 14mm 8mm 9mm; }
h2 { margin: 0 0 7px; display: flex; align-items: center; gap: 7px; font: 600 7.4pt 'Geist Mono', monospace; letter-spacing: 0.09em; text-transform: uppercase; color: var(--ink); }
h2::before { content: ''; width: 9px; height: 2px; background: var(--olive); }
.bloque + .bloque { margin-top: 6.5mm; }
p { margin: 0; }

/* Barra lateral */
.cert { display: grid; grid-template-columns: auto 1fr; gap: 1px 8px; align-items: baseline; padding: 4px 0; border-bottom: 1px solid var(--line); }
.cert:last-child { border-bottom: 0; }
.code { font: 600 7.4pt 'Geist Mono', monospace; background: var(--ink); color: var(--lime); border-radius: 3px; padding: 1px 5px; }
.cert b { font-weight: 500; font-size: 8pt; line-height: 1.3; }
.cert small { grid-column: 2; font-size: 7pt; color: var(--soft); }
.cat + .cat { margin-top: 5px; }
.cat span { display: block; font-size: 7.4pt; color: var(--muted); margin-bottom: 2px; }
.chips { display: flex; flex-wrap: wrap; gap: 3px; }
.chip { font: 500 7.2pt 'Geist Mono', monospace; background: #fff; border: 1px solid var(--line); border-radius: 3px; padding: 1px 5px; }
.idioma { display: flex; justify-content: space-between; padding: 2px 0; }
.idioma .mono { color: var(--muted); font-size: 7.4pt; }
.comp { margin: 0; padding: 0; list-style: none; }
.comp li { padding: 1.5px 0 1.5px 11px; position: relative; color: #2b2f35; }
.comp li::before { content: ''; position: absolute; left: 0; top: 7px; width: 4px; height: 4px; border-radius: 4px; background: var(--olive); }

/* Columna principal */
.perfil { font-size: 9pt; line-height: 1.55; color: #2b2f35; }
.linea { position: relative; padding-left: 13px; border-left: 1px solid var(--line); margin-left: 3px; }
.hito { position: relative; padding-bottom: 8px; }
.hito:last-child { padding-bottom: 0; }
.hito::before { content: ''; position: absolute; left: -17px; top: 4px; width: 7px; height: 7px; border-radius: 7px; background: #fff; border: 1.5px solid var(--olive); }
.cab { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.cab b { font-size: 9.6pt; font-weight: 600; letter-spacing: -0.01em; }
.cab .mono { font-size: 7.2pt; color: var(--soft); white-space: nowrap; }
.sub { color: var(--muted); font-size: 8pt; margin-top: 1px; }
ul.logros { margin: 4px 0 0; padding-left: 13px; color: #2b2f35; }
ul.logros li { margin: 1.5px 0; }
.proyecto { border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; }
.proyecto .sub { margin-top: 3px; color: #2b2f35; font-size: 8.3pt; }
.proyecto .chips { margin-top: 6px; }
.proyecto .chip { background: var(--side); }

footer { display: flex; justify-content: space-between; gap: 10mm; padding: 3.5mm 14mm; border-top: 1px solid var(--line); font: 6.8pt 'Geist Mono', monospace; color: var(--soft); }
footer b { color: var(--olive); font-weight: 500; }
</style></head><body>

<header>
  <div>
    <span class="pill"><i></i>${esc(meta.disponibilidad)}</span>
    <h1>${esc(meta.nombre)}</h1>
    <p class="rol">${esc(meta.titulo)}</p>
  </div>
  <ul class="contacto">
    ${lista(contacto, ([k, txt, href]) => `<li>${href ? `<a href="${esc(href)}">${esc(txt)}</a>` : esc(txt)}${icono(k)}</li>`)}
  </ul>
</header>

<div class="cuerpo">
  <aside>
    <div class="bloque">
      <h2>Certificaciones</h2>
      ${lista(
        certificaciones,
        (c) => `<div class="cert"><span class="code">${esc(c.codigo)}</span><b>${esc(c.nombre.replace(/^Microsoft Certified:\s*/, ''))}</b><small>${esc(c.entidad)} · ${esc(c.fecha)}</small></div>`,
      )}
    </div>

    <div class="bloque">
      <h2>Stack</h2>
      ${lista(
        stack,
        (c) => `<div class="cat"><span>${esc(c.titulo)}</span><div class="chips">${lista(c.tecnologias, (t) => `<span class="chip">${esc(t.nombre)}</span>`)}</div></div>`,
      )}
    </div>

    <div class="bloque">
      <h2>Idiomas</h2>
      ${lista(idiomas, (l) => `<div class="idioma"><span>${esc(l.idioma)}</span><span class="mono">${esc(l.nivel)}</span></div>`)}
    </div>

    ${
      sobre_mi.capacidades?.length
        ? `<div class="bloque"><h2>Competencias</h2><ul class="comp">${lista(sobre_mi.capacidades, (c) => `<li>${esc(c)}</li>`)}</ul></div>`
        : ''
    }
  </aside>

  <main>
    <div class="bloque">
      <h2>Perfil</h2>
      <p class="perfil">${esc(sobre_mi.resumen)}</p>
    </div>

    <div class="bloque">
      <h2>Experiencia</h2>
      <div class="linea">
        ${lista(
          experiencia,
          (e) => `<div class="hito">
          <div class="cab"><b>${esc(e.puesto)}</b><span class="mono">${fecha(e.fecha_inicio)} — ${fecha(e.fecha_fin)}</span></div>
          <p class="sub">${esc(e.empresa)}${e.tipo_empleo ? ` · ${esc(e.tipo_empleo)}` : ''}</p>
          <ul class="logros">${lista(e.logros, (l) => `<li>${esc(l)}</li>`)}</ul>
        </div>`,
        )}
      </div>
    </div>

    <div class="bloque">
      <h2>Formación</h2>
      <div class="linea">
        ${lista(
          formacion,
          (f) => `<div class="hito"><div class="cab"><b>${esc(f.titulo)}</b><span class="mono">${fecha(f.fecha_inicio)} — ${fecha(f.fecha_fin)}</span></div><p class="sub">${esc(f.institucion)}</p></div>`,
        )}
      </div>
    </div>

    ${
      proyectos?.length
        ? `<div class="bloque"><h2>Proyecto destacado</h2>${lista(
            proyectos.slice(0, 2),
            (p) => `<div class="proyecto"><div class="cab"><b>${esc(p.nombre)}</b><span class="mono">${esc(p.tipo ?? '')}</span></div><p class="sub">${esc(p.solucion ?? p.descripcion)}</p><div class="chips">${lista(p.tecnologias, (t) => `<span class="chip">${esc(t)}</span>`)}</div></div>`,
          )}</div>`
        : ''
    }
  </main>
</div>

<footer>
  <span><b>Versión pública del CV</b> · CV completo disponible a petición</span>
  <span>${esc(corta(meta.web || meta.linkedin))}</span>
</footer>
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
  if (process.env.CV_HTML) writeFileSync(process.env.CV_HTML, html)
  execFileSync(
    buscarNavegador(),
    [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--user-data-dir=${join(dir, 'perfil')}`,
      '--virtual-time-budget=8000',
      `--print-to-pdf=${salida}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'ignore' },
  )
  console.log(`CV generado: ${salida}`)
} finally {
  rmSync(dir, { recursive: true, force: true })
}
