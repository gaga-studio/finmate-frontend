/** UI.md 3.3 — 로고. public/FinMate_Logo.png는 투명 배경 PNG라 배경에 직접 얹는다. */
export function Logo({ size = 22 }: { size?: number }) {
  return <img src="/FinMate_Logo.png" alt="FinMate" style={{ height: size }} />
}
