/**
 * Formats a string with proper pluralization based on count
 * @example
 * pluralize(1, 'dog') // "1 dog"
 * pluralize(2, 'cat') // "2 cats"
 * pluralize(3, 'angry', 'mouse', 'mice') // "3 angry mice"
 * pluralize(3, 'mouse', 'mice', false) // "mice"
 * pluralize(1000, 'view') // "1,000 views"
 */
const pluralize = (
  count: number,
  singularOrModifier: string,
  singularOrPlural?: string,
  pluralOrShowCount?: string | boolean,
  showCount?: boolean,
) => {
  // Determine if first string is modifier or singular
  const hasModifier = singularOrPlural !== undefined
  const modifier = hasModifier ? singularOrModifier : undefined
  const singular = hasModifier ? singularOrPlural : singularOrModifier
  const plural =
    typeof pluralOrShowCount === 'string' ? pluralOrShowCount : undefined
  const prefixCount =
    typeof pluralOrShowCount === 'boolean'
      ? pluralOrShowCount
      : (showCount ?? true)

  const label = count === 1 ? singular : plural || singular + 's'
  const modifierString = modifier ? `${modifier} ` : ''
  const formattedCount = count?.toLocaleString()

  return `${prefixCount ? `${formattedCount} ` : ''}${modifierString}${label}`
}

export { pluralize }
