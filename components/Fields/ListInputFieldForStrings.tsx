import { useAppContext } from '@/app/reducer/AppContext'
import { Icon } from '@/components/Icon'
import { Randy } from '@/components/Randy'
import { StyledText } from '@/components/StyledText'
import { PropertyName } from '@/lib/types'
import { ComponentProps, useState } from 'react'
import { FieldContainerProps } from './FieldContainer'
import { ListInputField } from './ListInputField'

export { ListInputFieldForStrings }

interface ListInputFieldForStringsProps
  extends Omit<ComponentProps<'textarea'>, 'type'>,
    Pick<FieldContainerProps<'label'>, 'label' | 'variant'> {
  propertyName: PropertyName
}

function ListInputFieldForStrings({
  label,
  propertyName,
}: ListInputFieldForStringsProps) {
  const { dispatch } = useAppContext()

  const [isShowingRandy, setIsShowingRandy] = useState(false)

  return (
    <>
      <ListInputField
        label={label}
        propertyName={propertyName}
        renderBottomSlot={
          process.env.NODE_ENV === 'development' && (
            <div className="mt-1 flex justify-end">
              <StyledText
                as="button"
                className="flex items-center gap-1"
                variant="button.secondary"
                onClick={() => setIsShowingRandy(true)}
              >
                <Icon
                  name="robot"
                  variant="solid"
                />
                Randy
              </StyledText>
            </div>
          )
        }
        validatorFunction={() => true}
      />

      <Randy
        isOpen={isShowingRandy}
        onClose={() => setIsShowingRandy(false)}
        onResponse={(response) => {
          dispatch({
            type: 'setStateByPath',
            payload: {
              path: `propertySettings.${propertyName}.modeOptions.list.options`,
              value: response,
            },
          })
        }}
      />
    </>
  )
}
