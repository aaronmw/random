import { ConditionalWrapper } from '@/components/ConditionalWrapper'
import { Icon } from '@/components/Icon'
import { Tooltip } from '@/components/Tooltip'
import { ComponentProps, ElementType, ReactNode } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

export { FieldContainer }
export type { FieldContainerProps }

type FieldContainerProps<T extends 'label' | 'div'> = Omit<
  ComponentProps<T>,
  'variant'
> & {
  as?: T
  label: ReactNode
  description?: ReactNode
  classNamesForInteractiveSurface?: string
  variant?: keyof typeof classNamesByVariant
}

const defaultClassNamesForInteractiveSurface = twJoin(
  'flex min-h-9 items-center',
  'bg-bg-secondary rounded-lg',
  'hover:outline',
  'hover:outline-border',
  'has-focus:outline',
  'has-focus:outline-border-selected',
)

const classNamesByVariant = {
  unlabeled: {
    container: '',
    interactiveSurfaceElement: 'label',
    interactiveSurface: '',
    field: '',
    label: 'hidden',
  },

  full: {
    container: 'col-span-4 flex items-center justify-between pl-2',
    interactiveSurfaceElement: 'field',
    interactiveSurface: '',
    field: 'flex justify-end',
    label: 'text-text-secondary flex items-center gap-1',
  },

  half: {
    container: 'col-span-2 grid grid-cols-subgrid pl-2',
    interactiveSurfaceElement: 'label',
    interactiveSurface: '',
    label: 'grid text-text-secondary col-start-1 col-end-2',
    field: 'grid col-start-2 col-end-3',
  },

  labelOnTop: {
    container: 'col-span-4 flex flex-col pl-2 gap-1',
    interactiveSurfaceElement: 'field',
    interactiveSurface: 'min-h-0',
    field: 'block',
    label: 'text-text-secondary flex items-center gap-1',
  },
}

const FieldContainer = <T extends 'label' | 'div'>({
  children,
  className,
  classNamesForInteractiveSurface,
  description,
  label,
  variant = 'unlabeled',
  as,
  ...otherProps
}: FieldContainerProps<T>) => {
  const classNames = classNamesByVariant[variant]
  const Component = (as ?? 'label') as ElementType

  return (
    <Component
      className={twMerge(
        classNames.interactiveSurfaceElement === 'label' && [
          defaultClassNamesForInteractiveSurface,
          classNamesForInteractiveSurface,
        ],
        classNames.container,
        className,
      )}
      {...otherProps}
    >
      <span className={classNames.label}>
        <span>{label}</span>
        {description && (
          <Tooltip tipContents={description}>
            <Icon name="circle-question" />
          </Tooltip>
        )}
      </span>
      <span className={classNames.field}>
        <ConditionalWrapper
          condition={classNames.interactiveSurfaceElement === 'field'}
          wrapper={(children) => (
            <span
              className={twMerge(
                defaultClassNamesForInteractiveSurface,
                classNames.interactiveSurface,
                classNamesForInteractiveSurface,
              )}
            >
              {children}
            </span>
          )}
        >
          {children}
        </ConditionalWrapper>
      </span>
    </Component>
  )
}
