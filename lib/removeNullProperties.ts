export function removeNullProperties(object: any): any {
  if (object === null) {
    return undefined
  }

  if (!Array.isArray(object) && typeof object === "object") {
    return Object.entries(object).reduce((acc, [key, value]) => {
      if (value === null) {
        return acc
      }

      return {
        ...acc,
        [key]: removeNullProperties(value),
      }
    }, {})
  }

  return object
}
