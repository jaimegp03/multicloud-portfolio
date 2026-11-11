const BTN_BASE =
  'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-[transform,background-color,border-color,color] duration-200 active:scale-[0.97]'

export const btn = {
  primary: `${BTN_BASE} bg-accent text-accent-fg hover:brightness-95`,
  secondary: `${BTN_BASE} border border-line bg-bg-elev text-fg hover:border-line-strong hover:bg-bg-elev-2`,
}

const MESES = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.']

/** "2023-01" → "ene. 2023"; cualquier otro formato se deja tal cual. */
export function formatFecha(valor) {
  const m = /^(\d{4})-(\d{2})$/.exec(valor ?? '')
  return m ? `${MESES[Number(m[2]) - 1]} ${m[1]}` : valor
}
