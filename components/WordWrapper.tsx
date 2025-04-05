import { ComponentProps, ElementType, type ReactNode } from 'react'

export type WordWrapperProps<T extends ElementType = 'span'> = Omit<
  ComponentProps<T>,
  'words' | 'sliceStart' | 'sliceEnd' | 'wrapper'
> & {
  as?: T
  words: string
  sliceStart: number
  sliceEnd?: number
  wrapper: (words: string) => ReactNode
}

export function WordWrapper<T extends ElementType = 'span'>({
  as,
  words,
  sliceStart,
  sliceEnd,
  wrapper,
  ...otherProps
}: WordWrapperProps<T>): ReactNode {
  const Component = as || 'span'
  const wordsArray = words.split(' ')
  const wrappedText = wordsArray.slice(sliceStart, sliceEnd).join(' ')

  const beforeText = wordsArray.slice(0, sliceStart).join(' ')
  const afterText = sliceEnd ? wordsArray.slice(sliceEnd).join(' ') : ''

  return (
    <Component {...otherProps}>
      {beforeText}
      {beforeText ? ' ' : ''}
      {wrapper(wrappedText)}
      {afterText ? ' ' : ''}
      {afterText}
    </Component>
  )
}
