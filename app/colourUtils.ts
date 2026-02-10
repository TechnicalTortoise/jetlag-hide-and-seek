import colors from 'tailwindcss/colors'

export function getRGB(color: [string, number]): string {
  const appConfig = useAppConfig()
  const colorName = appConfig.ui.colors[color[0]]
  const colorValue = colors[colorName]?.[color[1]]
  return colorValue
}

export function hexToRGBA(hex: string, alpha: number): string {
  console.warn(hex, alpha)
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  console.warn(r, g, b)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
