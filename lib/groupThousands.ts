export function groupThousands(val: number) {
  return val.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
}
