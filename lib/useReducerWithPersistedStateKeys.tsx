"use client"

import { pick } from "lodash"
import { Dispatch, Reducer, useEffect, useReducer } from "react"

export const useReducerWithPersistedStateKeys = <T, A>({
  initializer,
  initialState,
  localStorageKeyName,
  persistedKeys,
  reducer,
}: {
  initializer?: (args: {
    initialState: T
    savedState: Partial<T>
    finalState: T
  }) => T
  initialState: T
  localStorageKeyName: string
  persistedKeys: (keyof T)[]
  reducer: Reducer<T, A>
}): [state: T, dispatch: Dispatch<A>] => {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    if (typeof window === "undefined") {
      return initialState
    }

    const rawSavedState = window.localStorage.getItem(localStorageKeyName)

    const savedState = rawSavedState
      ? pick(JSON.parse(rawSavedState), persistedKeys)
      : {}

    const finalState = {
      ...initialState,
      ...savedState,
    }

    return initializer?.({ initialState, savedState, finalState }) ?? finalState
  })

  useEffect(() => {
    const updatedSavedState = pick(state, persistedKeys)

    window.localStorage.setItem(
      localStorageKeyName,
      JSON.stringify(updatedSavedState),
    )
  }, [localStorageKeyName, persistedKeys, state])

  return [state, dispatch]
}
