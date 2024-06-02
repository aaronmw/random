'use client'

import { Box } from '@/app/components/Box'
import { Icon } from '@/app/components/Icon'
import { IconButton } from '@/app/components/IconButton'
import { PresetButtons } from '@/app/components/PresetButtons'
import { PropertyConfigPanel } from '@/app/components/PropertyConfigPanel'
import { classNames } from '@/app/properties/classNames'
import { AppContext } from '@/app/reducer'
import { PropertyName } from '@/lib/types'
import { useKeyPress } from '@/lib/useKeyPress'
import { pickBy } from 'lodash'
import { MouseEvent, useContext, useState } from 'react'
import { groupedPropertyNames } from './groupedPropertyNames'

export default function PropertiesIndexPage() {
  const {
    dispatch,
    state: { propertySettings },
  } = useContext(AppContext)

  const [keywords, setKeywords] = useState('')

  useKeyPress('k', (event) => {
    if (event.metaKey) {
      event.preventDefault()
      event.stopPropagation()

      const inputElement = document.querySelector(
        '.js-filter-input',
      ) as HTMLInputElement

      inputElement.select()
    }
  })

  function handleClickStopRandomizing(
    propertyName: PropertyName,
    event: MouseEvent,
  ) {
    event.preventDefault()
    event.stopPropagation()

    dispatch({
      type: 'setStateByPath',
      payload: {
        path: `propertySettings.${propertyName}.mode`,
        value: 'disabled',
      },
    })
  }

  const randomizedProperties = pickBy(
    propertySettings,
    (settings) => settings.mode !== 'disabled',
  )

  const filteredGroupedPropertyNames = groupedPropertyNames.reduce(
    (acc, [groupName, propertyNames]) => {
      const filteredPropertyNames = keywords
        ? propertyNames.filter((propertyName) =>
            propertyName.toLowerCase().includes(keywords.toLowerCase()),
          )
        : propertyNames

      if (filteredPropertyNames.length > 0) {
        acc.push([groupName, filteredPropertyNames])
      }

      return acc
    },
    [] as [string, PropertyName[]][],
  )

  return (
    <div className={classNames.container}>
      <div className={classNames.filterContainer}>
        <Icon
          className={classNames.filterIcon}
          name="magnifying-glass"
        />

        <input
          className={classNames.filterInput}
          placeholder="Filter"
          type="search"
          onChange={(event) => setKeywords(event.target.value)}
        />

        <div className={classNames.keyboardShortcut}>⌘K</div>
      </div>

      <div className={classNames.groupsContainer}>
        {filteredGroupedPropertyNames.map(([groupName, propertyNames]) => {
          return (
            <div
              className={classNames.groupContainer}
              key={groupName}
            >
              <div className={classNames.groupHeading}>{groupName}</div>

              {propertyNames.map((propertyName) => (
                <PropertyConfigPanel
                  id={`${propertyName}-panel`}
                  key={propertyName}
                  propertyName={propertyName as PropertyName}
                />
              ))}
            </div>
          )
        })}
      </div>

      <div className={classNames.summaryContainer}>
        {Object.keys(randomizedProperties).map((propertyName) => (
          <Box
            className={classNames.summaryItem}
            key={propertyName}
          >
            <Box
              as="a"
              className={classNames.summaryLink}
              href={`#${propertyName}-panel`}
              variant="link"
            >
              {propertyName}
            </Box>

            <IconButton
              iconName="xmark"
              label="Stop randomizing"
              onClick={handleClickStopRandomizing.bind(
                null,
                propertyName as PropertyName,
              )}
            />
          </Box>
        ))}

        <PresetButtons />
      </div>
    </div>
  )
}
