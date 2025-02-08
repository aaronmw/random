'use client'

import { AppContext } from '@/app/reducer'
import { Box } from '@/components/Box'
import { Icon } from '@/components/Icon'
import { IconButton } from '@/components/IconButton'
import { PresetButtons } from '@/components/PresetButtons'
import { PropertyConfigPanel } from '@/components/PropertyConfigPanel'
import { PropertyName } from '@/lib/types'
import { useKeyPress } from '@/lib/useKeyPress'
import pickBy from 'lodash/pickBy'
import { MouseEvent, useContext, useState } from 'react'
import { twJoin } from 'tailwind-merge'
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
    <div
      className={twJoin(
        `grid h-full grid-cols-1 grid-rows-[min-content_auto_min-content] overflow-hidden`,
      )}
    >
      <div
        className={twJoin(
          `group bg-bg-hover relative row-start-1 row-end-2 items-center border-b px-2 py-[4px]`,
        )}
      >
        <Icon
          className={twJoin(`absolute top-1/2 left-5 -translate-y-1/2 pt-0.5`)}
          name="magnifying-glass"
        />

        <input
          className={twJoin(
            `js-filter-input bg-bg text-text placeholder:text-text/50 w-full rounded-full border px-10 py-1.5 [font-size:inherit]`,
          )}
          placeholder="Filter"
          type="search"
          onChange={(event) => setKeywords(event.target.value)}
        />

        <div
          className={twJoin(
            `text-fadedTextColor absolute top-1/2 right-6 -translate-y-1/2 pt-0.5 text-sm group-has-[input:focus]:opacity-0`,
          )}
        >
          ⌘K
        </div>
      </div>

      <div
        className={twJoin(
          `relative row-start-2 row-end-3 scroll-pt-8 overflow-y-auto scroll-smooth`,
        )}
      >
        {filteredGroupedPropertyNames.map(([groupName, propertyNames]) => {
          return (
            <div
              className={twJoin(` `)}
              key={groupName}
            >
              <div
                className={twJoin(
                  `bg-bg-hover text-fadedTextColor sticky top-0 z-10 px-4 py-1`,
                )}
              >
                {groupName}
              </div>

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

      <div className={twJoin(`bg-bg-hover row-start-3 row-end-4 border-t`)}>
        {Object.keys(randomizedProperties).map((propertyName) => (
          <Box
            className={twJoin(`flex items-center justify-between pr-2`)}
            key={propertyName}
          >
            <Box
              as="a"
              className={twJoin(
                `flex w-full items-center justify-between px-4 py-px hover:no-underline`,
              )}
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
