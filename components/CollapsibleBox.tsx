import { Collapsible as BaseUICollapsible } from '@base-ui-components/react'
import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

export function CollapsibleBox({
  children,
  className,
  disabled,
  isCollapsed,
  onOpenChange,
  ...otherProps
}: ComponentProps<'div'> & {
  disabled?: boolean
  isCollapsed: boolean
  onOpenChange?: (isOpen: boolean) => void
}) {
  return (
    <BaseUICollapsible.Root
      className={className}
      disabled={disabled}
      onOpenChange={onOpenChange}
      open={!isCollapsed}
      {...otherProps}
    >
      <BaseUICollapsible.Panel
        className={twMerge(
          'grid grid-rows-[1fr] transition-all',
          'data-starting-style:grid-rows-[0fr]',
          'data-ending-style:grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </BaseUICollapsible.Panel>
    </BaseUICollapsible.Root>
  )
}
