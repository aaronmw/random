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

interface GeneratorProps extends Pick<ModalWindowProps, 'isOpen' | 'onClose'> {
  onResponse: (response: string[]) => void
  isColor?: boolean
}

export function Generator({
  isOpen,
  onClose,
  onResponse,
  isColor = false,
}: GeneratorProps) {
  const [isFetchingResults, setIsFetchingResults] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = isColor ? colorPromptSuggestions : promptSuggestions

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null)
      setUserPrompt(sample(suggestions))
      requestAnimationFrame(() => {
        inputRef.current?.select()
      })
    }
  }, [isOpen, suggestions])

  const [userPrompt, setUserPrompt] = useState(sample(suggestions))

  const [resultCount, setResultCount] = useState(20)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    event.stopPropagation()

    const clampedCount = Math.min(50, Math.max(2, resultCount))

    setIsFetchingResults(true)

    try {
      const response = await fetch('/api/query-chatgpt', {
        method: 'POST',
        body: JSON.stringify({
          prompt: userPrompt,
          isColor,
          resultCount: clampedCount,
        }),
      })

      const data = await response.json()

      if (!response.ok || !Array.isArray(data)) {
        const err = data as { error?: string; details?: string }
        const message =
          [err.error, err.details].filter(Boolean).join(': ') ||
          'Something went wrong'
        setErrorMessage(message)
        return
      }

      onResponse(data)
      onClose()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong',
      )
    } finally {
      setIsFetchingResults(false)
    }
  }

  const handleClose = () => {
    setErrorMessage(null)
    onClose()
  }

  return (
    <ModalWindow
      isOpen={isOpen}
      classNamesForCloseButton={errorMessage ? undefined : 'hidden'}
      onClose={handleClose}
    >
      {errorMessage ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-text text-lg font-medium">
            Couldn&apos;t generate
          </h2>
          <p className="text-text-secondary text-sm">{errorMessage}</p>
          <div className="flex justify-end">
            <button
              type="button"
              className="button-primary"
              onClick={handleClose}
            >
              OK
            </button>
          </div>
        </div>
      ) : (
        <form
          className={twJoin(
            `m-0 flex flex-col gap-2 transition-opacity`,
            isFetchingResults && `pointer-events-none animate-pulse`,
          )}
          onSubmit={handleSubmit}
        >
          <input
            autoFocus={true}
            className="bg-bg text-text w-full border px-5 py-2 text-center"
            maxLength={100}
            ref={inputRef}
            type="text"
            value={userPrompt}
            onChange={(event) => setUserPrompt(event.target.value)}
          />

          <div className="flex items-center justify-center gap-2">
            <label className="text-text-secondary text-sm" htmlFor="result-count">
              Count:
            </label>
            <input
              className="bg-bg text-text w-16 border px-2 py-1 text-center"
              id="result-count"
              max={50}
              min={2}
              type="number"
              value={resultCount}
              onChange={(event) =>
                setResultCount(
                  Math.min(50, Math.max(2, Number(event.target.value) || 2)),
                )
              }
            />
            <button
              className="button-primary flex items-center gap-1"
              type="submit"
            >
              <Icon
                name="sparkles"
                variant="solid"
              />
              Generate
            </button>
          </div>
        </form>
      )}
    </ModalWindow>
  )
}
