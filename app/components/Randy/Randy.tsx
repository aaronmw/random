"use client"

import { Button } from "@/app/components/Button"
import { Icon } from "@/app/components/Icon"
import { ModalWindow, ModalWindowProps } from "@/app/components/ModalWindow"
import { sample } from "lodash"
import { FormEvent, useEffect, useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { queryChatGPT } from "./queryChatGPT"

const promptSuggestions = [
  "american cities",
  "american states",
  "canadian cities",
  "canadian provinces",
  "cities",
  "corporation names",
  "amounts between $9.99 and $999.99",
  "fake company names",
  "famous people",
  "famous animals",
  "first and last names",
  "popular bands from the 90's",
  "silly names",
  "types of fish",
  "types of dog",
]

interface RandyProps extends Pick<ModalWindowProps, "isOpen" | "onClose"> {
  onResponse: (response: string[]) => void
}

export function Randy({ isOpen, onClose, onResponse }: RandyProps) {
  const [isFetchingResults, setIsFetchingResults] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setUserPrompt(sample(promptSuggestions))
      requestAnimationFrame(() => {
        inputRef.current?.select()
      })
    }
  }, [isOpen])

  const [userPrompt, setUserPrompt] = useState(sample(promptSuggestions))

  // TODO: Afford customization, or extract into config constant
  const [resultCount, setResultCount] = useState(20)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    event.stopPropagation()

    // TODO: Actually make this safe
    const safePrompt = `Give me ${resultCount} random ${userPrompt}`

    setIsFetchingResults(true)

    try {
      const response = (await queryChatGPT(safePrompt)) || []

      onResponse(response)

      onClose()
    } catch (error) {
      console.error(error)

      onClose()
    }

    setIsFetchingResults(false)

    onClose()
  }

  return (
    <ModalWindow
      isOpen={isOpen}
      classNamesForCloseButton="hidden"
      onClose={onClose}
    >
      <form
        className={twJoin(
          `
            m-0
            flex
            transition-opacity
          `,
          isFetchingResults &&
            `
              pointer-events-none
              animate-pulse
            `,
        )}
        onSubmit={handleSubmit}
      >
        <input
          autoFocus={true}
          className="
            w-full
            border
            bg-bgColor
            px-3
            py-1
            text-center
            text-textColor
          "
          maxLength={40}
          ref={inputRef}
          type="text"
          value={userPrompt}
          onChange={(event) => setUserPrompt(event.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
        >
          <Icon
            name="robot"
            variant="solid"
          />
        </Button>
      </form>
    </ModalWindow>
  )
}
