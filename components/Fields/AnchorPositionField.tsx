import { useAppContext } from '@/app/reducer/AppContext'
import { tooltips } from '@/app/tooltips'
import { PropertyName } from '@/lib/types'
import { MouseEvent } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

export { AnchorPositionField }

interface AnchorPositionFieldProps
  extends Pick<
    FieldContainerProps<'div'>,
    'label' | 'variant' | 'description'
  > {
  propertyName: PropertyName
}

const AnchorPositionField = ({
  label,
  description,
  propertyName,
  variant,
}: AnchorPositionFieldProps) => {
  const {
    dispatch,
    state: { propertySettings },
  } = useAppContext()

  const thisPropertySettings = propertySettings[propertyName]

  const { anchorPosition, preserveAspectRatio } = thisPropertySettings

  const axis =
    propertyName === 'width' && !preserveAspectRatio
      ? 'x'
      : propertyName === 'height' && !preserveAspectRatio
        ? 'y'
        : 'all'

  const handleClickAnchor = (
    newValue: string | number,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()

    dispatch({
      type: 'setStateByPath',
      payload: {
        path: `propertySettings.${propertyName}.anchorPosition`,
        value: newValue,
      },
    })
  }

  return (
    <FieldContainer
      as="div"
      label={label}
      description={description ?? tooltips.transformOrigin(propertyName)}
      variant={variant}
      className="h-auto"
      classNamesForInteractiveSurface="outline-none!"
    >
      <div
        className={twJoin(
          'group/field',
          'grid grid-cols-3 grid-rows-3',
          'leading-none outline-0',
        )}
      >
        {[
          'top-left',
          'top-center',
          'top-right',
          'center-left',
          'center-center',
          'center-right',
          'bottom-left',
          'bottom-center',
          'bottom-right',
        ].map((anchorName) => {
          const isSelected = anchorName === anchorPosition

          const isSelectable =
            axis === 'all' ||
            (axis === 'x' &&
              ['center-left', 'center-center', 'center-right'].includes(
                anchorName,
              )) ||
            (axis === 'y' &&
              ['top-center', 'center-center', 'bottom-center'].includes(
                anchorName,
              ))

          return (
            <button
              data-is-selectable={isSelectable || undefined}
              data-is-selected={(isSelectable && isSelected) || undefined}
              className={twMerge(
                'group/button',
                'pointer-default pointer-events-none',
                'h-[21px] w-[28px]',
                'flex items-center justify-center',
                'data-is-selectable:pointer-events-auto',
                'data-is-selectable:cursor-pointer',
              )}
              key={anchorName}
              onClick={
                isSelectable
                  ? handleClickAnchor.bind(null, anchorName)
                  : undefined
              }
            >
              <div
                className={twJoin(
                  'size-[2px] rounded-[2px]',
                  'group-data-is-selectable/button:bg-bg-disabled',
                  'group-data-is-selected/button:size-[10px]',
                  'group-data-is-selected/button:bg-icon-selected',
                  'group-hover/button:size-[10px]',
                  'group-hover/button:bg-icon-pressed',
                )}
              />
            </button>
          )
        })}
      </div>
    </FieldContainer>
  )
}
