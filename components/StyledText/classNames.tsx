import { twJoin, twMerge } from 'tailwind-merge'

const buttonClassNames = twJoin(
  'inline-flex items-center justify-center gap-1.5',
  'cursor-pointer whitespace-nowrap transition-all',
  'rounded-lg',
  'disabled:pointer-events-none',
  'disabled:bg-bg-disabled',
  'disabled:text-text-ondisabled',
)

const inputClassNames = twJoin(
  'w-full border-0 outline-0',
  'text-text bg-transparent [font-size:inherit]',
  'placeholder:text-text-tertiary',
  'disabled:bg-bg-disabled',
  'disabled:text-text-ondisabled',
)

export const classNames = {
  'link': twMerge(buttonClassNames, 'whitespace-wrap text-brand-color inline'),

  'link.subtle': twMerge(buttonClassNames, 'whitespace-wrap inline'),

  'button.primary': twMerge(
    buttonClassNames,
    'js-button-primary',
    'px-4 py-3',
    'bg-bg-brand text-text-onbrand',
    'hover:bg-bg-brand-hover hover:text-text-onbrand-hover',
  ),

  'button.secondary': twMerge(
    buttonClassNames,
    'js-button-secondary',
    'px-4 py-3',
    'text-text-secondary',
    'hover:bg-bg-hover hover:text-text-hover',
  ),

  'button.togglable': twMerge(
    buttonClassNames,
    'js-button-togglable',
    'text-text-secondary',
    'px-4 py-3',
    'data-[active]:bg-bg-hover',
    'data-[active]:text-text',
    'hover:bg-bg-hover',
  ),

  'button.icon': twMerge(
    buttonClassNames,
    'js-button-icon',
    'flex items-center justify-center',
    'h-9 min-w-9 px-2',
    'hover:bg-bg-hover hover:text-text-hover',
  ),

  'button.icon.togglable': twMerge(
    buttonClassNames,
    'js-button-icon-selectable',
    'flex items-center justify-center',
    'h-9 min-w-9 px-2',
    'text-text-secondary bg-transparent',
    'hover:bg-bg-hover hover:text-text-hover',
    'data-[active]:bg-bg-selected',
    'data-[active]:text-text-selected',
    'data-[active]:hover:bg-bg-selected-hover',
    'data-[active]:hover:text-text-onselected-hover',
  ),

  'button.icon.togglable.secondary': twMerge(
    buttonClassNames,
    'js-button-icon-selectable',
    'flex items-center justify-center',
    'h-9 min-w-9 px-2',
    'text-text-secondary border border-transparent',
    'hover:bg-bg-hover hover:text-text-hover',
    'data-[active]:bg-bg',
    'data-[active]:text-text',
    'data-[active]:border-border',
  ),

  'footnote': twJoin(
    'text-faded-text-color inverted:text-faded-text-colorInDarkMode dark:text-faded-text-colorInDarkMode text-xs leading-relaxed',
  ),

  'input': twJoin(
    inputClassNames,
    'rounded-lg',
    'px-2 py-1',
    'hover:outline-border hover:outline',
    'focus:outline-border-selected focus:outline',
  ),

  'inputWithoutBorder': inputClassNames,

  'label': twJoin(
    'text-faded-text-color inverted:text-faded-text-colorInDarkMode dark:text-faded-text-colorInDarkMode text-sm',
  ),
}
