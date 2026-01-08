'use client'

import { PropertyName } from '@/app/types'
import { dataTypesByPropertyName } from '@/lib/dataTypesByPropertyName'

const allPropertyNames = Object.keys(dataTypesByPropertyName) as PropertyName[]

export function PropertySettingsLoadingPlaceholder() {
  return (
    <div className="flex flex-col">
      {allPropertyNames.map((propertyName) => (
        <div
          key={propertyName}
          className="h-11 pr-3 pl-5 flex items-center justify-between bg-bg-secondary animate-pulse"
        >
          <div className="h-4 bg-bg-tertiary rounded w-24" />
          <div className="h-6 w-6 bg-bg-tertiary rounded" />
        </div>
      ))}
    </div>
  )
}
