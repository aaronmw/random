export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
): obj is T & Record<K, any> {
  return key in obj
}
