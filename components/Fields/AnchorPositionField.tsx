import { AppContext } from '@/app/reducer'
import { PropertyName } from '@/lib/types'
import { MouseEvent, useContext } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

export { AnchorPositionField }

interface AnchorPositionFieldProps
  extends Pick<FieldContainerProps, 'label' | 'variant'> {
  propertyName: PropertyName
}

const classNames = {
  container: twJoin(`flex size-[30px] flex-wrap leading-none outline-0`),

  clickableSurface: ({ isSelected = false, isSelectable = false }) =>
    twMerge(
      isSelectable && 'is-selectable',
      isSelected && 'is-selected',
      `group size-[10px] [&.is-selectable]:pointer-events-auto [&.is-selectable]:cursor-pointer [&:not(.is-selectable)]:pointer-events-none`,
    ),

  visibleAnchorButton: twJoin(
    `group-[&.is-selectable:not(.is-selected):hover]:border-border-brand group-[&.is-selectable:not(.is-selected)]:border-fadedTextColor group-[&.is-selected]:border-text group-[&.is-selectable:not(.is-selected):hover]:bg-bg-brand group-[&.is-selected]:bg-text group-[&:not(.is-selectable)]:bg-bg-hover m-[2px] size-[6px] group-[&.is-selectable]:border group-[&.is-selectable:not(.is-selected)]:bg-transparent`,
  ),
}

const AnchorPositionField = ({
  label,
  propertyName,
  variant,
}: AnchorPositionFieldProps) => {
  const {
    dispatch,
    state: { propertySettings },
  } = useContext(AppContext)

  const thisPropertySettings = propertySettings[propertyName]

  const { anchor, preserveAspectRatio } = thisPropertySettings

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
        path: `propertySettings.${propertyName}.anchor`,
        value: newValue,
      },
    })
  }

  return (
    <FieldContainer
      className="h-auto"
      label={label}
      variant={variant}
    >
      <div className={classNames.container}>
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
          const isSelected = anchorName === anchor

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
              className={classNames.clickableSurface({
                isSelected,
                isSelectable,
              })}
              key={anchorName}
              onClick={
                isSelectable
                  ? handleClickAnchor.bind(null, anchorName)
                  : undefined
              }
            >
              <div className={classNames.visibleAnchorButton} />
            </button>
          )
        })}
      </div>
    </FieldContainer>
  )
}
