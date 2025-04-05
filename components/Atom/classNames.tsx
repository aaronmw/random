import { twJoin, twMerge } from 'tailwind-merge'

const buttonClassNames = twJoin(
  'inline-flex items-center justify-center gap-1.5',
  'cursor-default whitespace-nowrap transition-all',
  'rounded-lg',
  'data-disabled:pointer-events-none',
  'data-disabled:text-text-disabled',
)

const inputClassNames = twJoin(
  'w-full border-0 outline-0',
  'cursor-default',
  'text-text bg-transparent text-center [font-size:inherit]',
  'placeholder:text-text-tertiary',
  'data-disabled:bg-bg-disabled',
  'data-disabled:text-text-ondisabled',
)

const badgeClassNames = twJoin(
  'px-2 pt-1 pb-[0.2em] leading-none',
  'inline-flex items-center gap-1 rounded-full',
  'whitespace-nowrap not-italic',
  'cursor-default',
)

export const classNames = {
  'link': twMerge(buttonClassNames, 'whitespace-wrap text-text-brand inline'),

  'button.primary': twMerge(
    buttonClassNames,
    'js-button-primary',
    'px-4 py-3',
    'bg-bg-brand text-text-onbrand',
    'hover:bg-bg-brand-hover hover:text-text-onbrand-hover',
    'data-disabled:bg-bg-disabled',
    'data-disabled:text-text-ondisabled',
  ),

  'button.secondary': twMerge(
    buttonClassNames,
    'js-button-secondary',
    'px-4 py-3',
    'text-text-secondary',
    'hover:bg-bg-hover hover:text-text-hover',
  ),

  'button.ghost': twMerge(
    buttonClassNames,
    'js-button-ghost',
    'px-4 py-3',
    'text-text-brand',
    'border-border-brand border-2 border-dashed',
    'bg-bg-brand/5',
    'hover:bg-bg-brand/10',
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

  'input': twJoin(
    inputClassNames,
    'px-2 py-1',
    'bg-bg-secondary rounded-lg',
    'hover:outline-border hover:outline',
    'focus:outline-border-selected focus:outline',
  ),

  'inputWithoutBorder': inputClassNames,

  'label': twJoin('text-text-secondary text-sm'),

  'label.group': twJoin(
    'sticky top-0 right-0 left-0 z-40',
    'text-text-secondary text-sm uppercase',
    'bg-bg-tertiary px-5 py-2',
  ),

  'badge.propertyName': twJoin(
    badgeClassNames,
    'text-text-component font-mono',
    'border-border-component rounded-lg border-2',
  ),

  'badge.propertyValue': twJoin(
    badgeClassNames,
    'text-text font-mono',
    'border-border rounded-lg border',
    'hover:bg-bg-hover',
  ),

  'pill.danger': twJoin(badgeClassNames, 'bg-bg-danger text-text-ondanger'),

  'pill.neutral': twJoin(badgeClassNames, 'bg-bg-hover text-text-hover'),

  'pill.interactive': twJoin(
    badgeClassNames,
    'border border-transparent',
    'bg-bg text-text',
    'hover:text-text-brand',
    'hover:bg-bg-hover',
    'hover:border-border-brand',
  ),

  'popover': twJoin('dark', 'block py-2', 'rounded-2xl bg-black/90 text-white'),
} satisfies Record<string, string>
