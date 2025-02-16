'use client'

import { useAppContext } from '@/app/reducer/AppContext'
import { Icon } from '@/components/Icon'
import { StyledText } from '@/components/StyledText'

export default function PropertiesPage() {
  const { state } = useAppContext()
  const { propertySettings } = state

  return (
    <div className="bg-bg-secondary col-span-2 row-span-2 grid place-items-center">
      <div className="text-text-secondary flex flex-col-reverse items-center gap-5">
        <StyledText
          variant="label"
          className="w-[20ch] text-center text-balance"
        >
          Select a property from the left and click its <Icon name="shuffle" />{' '}
          button to randomize it
        </StyledText>

        <Icon
          name="thin:circle-arrow-left"
          className="text-6xl"
        />
      </div>
    </div>
  )
}
