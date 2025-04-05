export function isColor({ value }: { value: string }) {
  if (typeof window === 'undefined' || !CSS.supports('color', value)) {
    return 'Color not recognized'
  }

  return true
}
