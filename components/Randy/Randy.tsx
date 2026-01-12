'use client'

import { Icon } from '@/components/Icon'
import { ModalWindow, ModalWindowProps } from '@/components/ModalWindow'
import sample from 'lodash/sample'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { twJoin } from 'tailwind-merge'

const promptSuggestions = [
  'american cities',
  'american states',
  'canadian cities',
  'canadian provinces',
  'cities',
  'corporation names',
  'amounts between $9.99 and $999.99',
  'fake company names',
  'famous people',
  'famous animals',
  'first and last names',
  "popular bands from the 90's",
  'silly names',
  'types of fish',
  'types of dog',
]

const colorPromptSuggestions = [
  'autumn shades',
  'apples',
  'ocean colors',
  'sunset colors',
  'forest greens',
  'berry colors',
  'sky blues',
  'earth tones',
  'pastel colors',
  'neon colors',
  'warm colors',
  'cool colors',
  'jewel tones',
  'desert colors',
  'tropical colors',
]

interface RandyProps extends Pick<ModalWindowProps, 'isOpen' | 'onClose'> {
  onResponse: (response: string[]) => void
  isColor?: boolean
}

export function Randy({ isOpen, onClose, onResponse, isColor = false }: RandyProps) {
  const [isFetchingResults, setIsFetchingResults] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = isColor ? colorPromptSuggestions : promptSuggestions

  useEffect(() => {
    if (isOpen) {
      setUserPrompt(sample(suggestions))
      requestAnimationFrame(() => {
        inputRef.current?.select()
      })
    }
  }, [isOpen, suggestions])

  const [userPrompt, setUserPrompt] = useState(sample(suggestions))

  // TODO: Afford customization, or extract into config constant
  const [resultCount, setResultCount] = useState(20)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    event.stopPropagation()

    // TODO: Actually make this safe
    const basePrompt = `Give me ${resultCount} random ${userPrompt}`
    const safePrompt = isColor
      ? `${basePrompt}. Return only hex color codes (format: #RRGGBB), one per line, with no additional text or descriptions.`
      : basePrompt

    setIsFetchingResults(true)

    try {
      const response =
        (await fetch('/api/query-chatgpt', {
          method: 'POST',
          body: JSON.stringify({ prompt: safePrompt, isColor }),
        })) || []

      const data = await response.json()

      onResponse(data)

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
          `m-0 flex transition-opacity`,
          isFetchingResults && `pointer-events-none animate-pulse`,
        )}
        onSubmit={handleSubmit}
      >
        <input
          autoFocus={true}
          className="bg-bg text-text w-full border px-5 py-2 text-center"
          maxLength={40}
          ref={inputRef}
          type="text"
          value={userPrompt}
          onChange={(event) => setUserPrompt(event.target.value)}
        />

        <button
          className="button-primary"
          type="submit"
        >
          <Icon
            name="robot"
            variant="solid"
          />
        </button>
      </form>
    </ModalWindow>
  )
}
