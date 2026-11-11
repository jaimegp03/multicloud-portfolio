/**
 * Diagrama de una plataforma multicloud. Cada capa (cloud, iac,
 * containers, cicd, network) se enciende cuando su capítulo está
 * activo. Las capas se dibujan planas, sin anidar, para que la
 * opacidad de una no afecte a las demás.
 */
const NODOS_X = [86, 140, 194]

const PROVEEDORES = [
  { x: 40, nombre: 'AWS', red: 'VPC 10.0.0.0/16' },
  { x: 290, nombre: 'Azure', red: 'VNet 10.1.0.0/16' },
]

function Flecha({ d, head }) {
  return (
    <>
      <path className="wire" d={d} />
      <path className="head" d={head} />
    </>
  )
}

export default function ArchitectureDiagram({ active }) {
  const capa = (id) => `layer ${active === id ? 'on' : 'off'}`

  return (
    <svg
      viewBox="0 0 560 430"
      role="img"
      aria-labelledby="arch-title arch-desc"
      className="arch h-auto max-h-[34vh] w-full lg:max-h-none"
    >
      <title id="arch-title">Arquitectura multicloud de referencia</title>
      <desc id="arch-desc">
        Un repositorio git dispara un pipeline de CI/CD que aplica Terraform sobre AWS y Azure. En cada
        proveedor hay una red privada con un clúster de Kubernetes de tres nodos Linux.
      </desc>

      {/* IaC: marco de Terraform que envuelve ambos proveedores */}
      <g className={capa('iac')}>
        <rect className="box tint dashed" x="20" y="104" width="520" height="306" rx="14" />
        <text x="36" y="126">terraform apply</text>
      </g>

      {/* Cloud: un bloque por proveedor */}
      <g className={capa('cloud')}>
        {PROVEEDORES.map((p) => (
          <g key={p.nombre}>
            <rect className="box solid" x={p.x} y="138" width="230" height="256" rx="10" />
            <text x={p.x + 14} y="160" style={{ fontWeight: 600 }}>
              {p.nombre}
            </text>
          </g>
        ))}
      </g>

      {/* Redes y sistemas: VPC/VNet, tráfico de usuarios y nodos Linux */}
      <g className={capa('network')}>
        {PROVEEDORES.map((p) => (
          <g key={p.red}>
            <rect className="box" x={p.x + 14} y="172" width="202" height="206" rx="8" />
            <text x={p.x + 26} y="192">
              {p.red}
            </text>
            {NODOS_X.map((nx) => (
              <text key={nx} x={p.x - 40 + nx + 4} y="366">
                linux
              </text>
            ))}
          </g>
        ))}
        <rect className="box solid" x="420" y="20" width="120" height="44" rx="8" />
        <text x="440" y="47">usuarios</text>
        <Flecha d="M480 64 V 98" head="M475 94 L480 102 L485 94 Z" />
      </g>

      {/* Contenedores: un clúster de 3 nodos por proveedor */}
      <g className={capa('containers')}>
        {PROVEEDORES.map((p) => (
          <g key={`k8s-${p.nombre}`}>
            <rect className="box" x={p.x + 28} y="206" width="174" height="136" rx="8" />
            <text x={p.x + 40} y="226">
              k8s cluster
            </text>
            {NODOS_X.map((nx) => (
              <g key={nx}>
                <rect className="box solid" x={p.x - 40 + nx} y="246" width="40" height="40" rx="6" />
                <rect className="box tint" x={p.x - 40 + nx + 10} y="256" width="20" height="8" rx="2" />
                <rect className="box tint" x={p.x - 40 + nx + 10} y="268" width="20" height="8" rx="2" />
              </g>
            ))}
            <text x={p.x + 40} y="314">
              3 nodos · pods
            </text>
          </g>
        ))}
      </g>

      {/* CI/CD: repo → pipeline → terraform */}
      <g className={capa('cicd')}>
        <rect className="box solid" x="20" y="20" width="120" height="44" rx="8" />
        <text x="40" y="47">git push</text>
        <Flecha d="M140 42 H 192" head="M188 37 L196 42 L188 47 Z" />
        <rect className="box solid" x="196" y="20" width="180" height="44" rx="8" />
        <text x="214" y="47">pipeline ci/cd</text>
        <Flecha d="M286 64 V 98" head="M281 94 L286 102 L291 94 Z" />
      </g>
    </svg>
  )
}
