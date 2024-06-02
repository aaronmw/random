import { useEffect } from "react"

export function useKeyPress(
  key: string,
  callback: (event: KeyboardEvent) => void,
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        callback(event)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [key, callback])
}
