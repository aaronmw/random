import { parseCSSColor } from "@/lib/parseCSSColor"

export function anyColorStringToRGB(color: string | number) {
  const colorAsRGBAArray = parseCSSColor(String(color))

  if (Array.isArray(colorAsRGBAArray)) {
    const [r, g, b] = colorAsRGBAArray

    return {
      r: r / 255,
      g: g / 255,
      b: b / 255,
    }
  }
  return false
}
