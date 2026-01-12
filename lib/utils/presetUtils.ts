export function formatPropertyName(label: string): string {
  return label
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

export function getPresetDisplayLabel(label: string | null | undefined): string {
  if (label === '__default__') {
    return 'Factory Reset (Default)'
  }
  return label || '(Untitled)'
}
