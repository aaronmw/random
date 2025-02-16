'use client'

import { Icon } from '@/components/Icon'
import { ModalWindow, ModalWindowProps } from '@/components/ModalWindow'
import { StyledText } from '@/components/StyledText'
import sample from 'lodash/sample'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { twJoin } from 'tailwind-merge'
import { queryChatGPT } from './queryChatGPT'

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

interface RandyProps extends Pick<ModalWindowProps, 'isOpen' | 'onClose'> {
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

        <StyledText
          as="button"
          type="submit"
          variant="button.primary"
        >
          <Icon
            name="robot"
            variant="solid"
          />
        </StyledText>
      </form>
    </ModalWindow>
  )
}
