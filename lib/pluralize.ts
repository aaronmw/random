/**
 * Formats a string with proper pluralization based on count
 * @example
 * pluralize(1, 'dog') // "1 dog"
 * pluralize(2, 'cat') // "2 cats"
 * pluralize(1, 'value is', 'values are') // "1 value is"
 * pluralize(2, 'value is', 'values are') // "2 values are"
 * pluralize(1000, 'view') // "1,000 views"
 * pluralize(2, 'view', undefined, false) // "views"
 */
const pluralize = (
  count: number,
  singular: string,
  plural?: string,
  showCount: boolean = true,
) => {
  const label = count === 1 ? singular : plural || `${singular}s`
  const formattedCount = count?.toLocaleString()

  return showCount ? `${formattedCount} ${label}` : label
}

export { pluralize }
