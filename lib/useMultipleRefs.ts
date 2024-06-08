import { Ref } from 'react'

const useMultipleRefs = (...refs: Array<Ref<any> | undefined>): Ref<any> => {
  const combineRefs = (element: any) =>
    refs.forEach((ref) => {
      if (!ref) {
        return
      }

      if (typeof ref === 'function') {
        ref(element)
      } else {
        ;(ref as any).current = element
      }
    })

  return combineRefs
}

export { useMultipleRefs }
