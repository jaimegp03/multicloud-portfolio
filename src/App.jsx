import { MotionConfig } from 'framer-motion'
import perfil from './data/perfil.json'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import StackScene from './components/StackScene'
import Certifications from './components/Certifications'
import Projects from './components/Projects'
import Trajectory from './components/Trajectory'
import Contact from './components/Contact'

/**
 * Portfolio "Control plane". Todo el contenido sale de
 * src/data/perfil.json; los componentes solo deciden cómo se ve.
 */
export default function App() {
  const { meta, sobre_mi, idiomas, stack, experiencia, proyectos, certificaciones, formacion } = perfil

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
      >
        Saltar al contenido
      </a>
      <Navbar nombre={meta.nombre} />
      <main id="contenido">
        <Hero meta={meta} certificaciones={certificaciones} />
        <About sobreMi={sobre_mi} idiomas={idiomas} />
        <StackScene stack={stack} />
        <Certifications certificaciones={certificaciones} />
        <Projects proyectos={proyectos} />
        <Trajectory experiencia={experiencia} formacion={formacion} />
      </main>
      <Contact meta={meta} />
    </MotionConfig>
  )
}
