import type { CSSProperties } from 'react'

export function anonymousAvatarStyle(seed?: string | null): CSSProperties | undefined {
  if (!seed) return undefined
  const hue = parseInt(seed.slice(0, 2), 16) % 360
  const hueOffset = (hue + 34) % 360
  return {
    '--pf-avatar-bg': `linear-gradient(145deg, hsl(${hue} 44% 90%), hsl(${hueOffset} 38% 78%))`,
    '--pf-avatar-ink': `hsl(${hue} 34% 28%)`,
  } as CSSProperties
}

export function anonymousAvatarGlyph(seed: string): string {
  const glyphs = ['●', '◆', '✦', '◐', '✺', '◇', '◌', '✧']
  const index = parseInt(seed.slice(2, 4), 16) % glyphs.length
  return glyphs[index]
}
