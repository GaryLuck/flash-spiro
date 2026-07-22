/**
 * Built-in Preset Library for Spirograph Studio
 * Curated geometric configurations with iconic symmetry ratios and color palettes.
 */

export const PRESETS = [
  {
    id: 'star-burst-5',
    title: '5-Point Star Burst',
    desc: 'Classic 105 teeth ring with 84 teeth wheel creating iconic 5-point star symmetry.',
    mode: 'hypo',
    R: 105,
    r: 84,
    dRatio: 0.75,
    penMode: 'glow',
    color: '#3a86ff',
    width: 2.5,
    opacity: 0.95,
    paper: 'studio'
  },
  {
    id: 'dahlia-flower-7',
    title: 'Dahlia Flower',
    desc: '105 teeth ring with 45 teeth wheel forming 7 overlapping flower petals.',
    mode: 'hypo',
    R: 105,
    r: 45,
    dRatio: 0.65,
    penMode: 'solid',
    color: '#ff006e',
    width: 2.0,
    opacity: 0.9,
    paper: 'studio'
  },
  {
    id: 'rainbow-vortex',
    title: 'Rainbow Vortex',
    desc: '96 teeth ring with 60 teeth wheel with dynamic rainbow HSL spectrum.',
    mode: 'hypo',
    R: 96,
    r: 60,
    dRatio: 0.8,
    penMode: 'rainbow',
    color: '#00f5d4',
    width: 2.0,
    opacity: 1.0,
    paper: 'neon'
  },
  {
    id: 'solar-flare-epi',
    title: 'Solar Flare (Epitrochoid)',
    desc: 'Wheel rolling outside fixed ring generating explosive starburst loops.',
    mode: 'epi',
    R: 96,
    r: 40,
    dRatio: 0.7,
    penMode: 'glow',
    color: '#ffbe0b',
    width: 2.2,
    opacity: 0.95,
    paper: 'studio'
  },
  {
    id: 'atomic-lattice',
    title: 'Atomic Lattice',
    desc: '144 teeth ring with 52 teeth wheel producing intricate dense orbit weaves.',
    mode: 'hypo',
    R: 144,
    r: 52,
    dRatio: 0.85,
    penMode: 'solid',
    color: '#00f5d4',
    width: 1.5,
    opacity: 0.85,
    paper: 'blueprint'
  },
  {
    id: 'vintage-mandala',
    title: 'Vintage Parchment Rose',
    desc: 'Classic ballpoint red ink on aged parchment paper.',
    mode: 'hypo',
    R: 105,
    r: 63,
    dRatio: 0.55,
    penMode: 'solid',
    color: '#c1121f',
    width: 2.0,
    opacity: 0.9,
    paper: 'parchment'
  },
  {
    id: 'galaxy-cycloid',
    title: 'Hyper Cycloid',
    desc: '120 teeth ring with 30 teeth wheel creating sharp 4-cusp geometry.',
    mode: 'hypo',
    R: 120,
    r: 30,
    dRatio: 0.9,
    penMode: 'glow',
    color: '#8338ec',
    width: 2.5,
    opacity: 1.0,
    paper: 'studio'
  }
];
