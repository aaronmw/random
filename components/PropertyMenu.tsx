'use client'

import { groupedPropertyNames } from '@/app/properties/groupedPropertyNames'
import { useAppContext } from '@/app/reducer/AppContext'
import { Icon } from '@/components/Icon'
import { Menu } from '@/components/Menu'
import { PresetButtons } from '@/components/PresetButtons'
import { StyledText } from '@/components/StyledText'
import { Tooltip } from '@/components/Tooltip'
import { PropertyName } from '@/lib/types'
import { useKeyPress } from '@/lib/useKeyPress'
import filter from 'lodash/filter'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ComponentProps, useState } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

export function PropertyMenu({ className, ...props }: ComponentProps<'div'>) {
  const { dispatch, state } = useAppContext()
  const params = useParams()
  const activePropertyName = params.propertyName as PropertyName

  const { propertySettings } = state

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

  const allPropertyNames = Object.keys(propertySettings) as PropertyName[]
  const enabledPropertyNames = filter(
    allPropertyNames,
    (propertyName) => propertySettings[propertyName].disabled !== true,
  )

  const filteredGroupedPropertyNames = groupedPropertyNames.reduce(
    (acc, [groupName, propertyNamesInGroup]) => {
      const matchingPropertyNames = keywords
        ? propertyNamesInGroup.filter((propertyName) =>
            propertyName.toLowerCase().includes(keywords.toLowerCase()),
          )
        : propertyNamesInGroup

      const filteredPropertyNames = matchingPropertyNames.filter(
        (propertyName) => enabledPropertyNames.includes(propertyName) === false,
      )

      if (filteredPropertyNames.length > 0) {
        acc.push([groupName, filteredPropertyNames])
      }

      return acc
    },
    [] as [string, PropertyName[]][],
  )

  return (
    <div
      id="ui-property-menu"
      className={twMerge(
        'group/sidebar',
        'col-start-1 col-end-2 row-start-1 row-end-2',
        'relative grid grid-rows-[min-content_auto]',
        'border-r-border border-r',
        'overflow-hidden',
        className,
      )}
      {...props}
    >
      <div id="ui-property-menu-fixed">
        {enabledPropertyNames.length >= 1 && (
          <div className="border-border-brand-strong rounded-lg border">
            <div
              className={twJoin(
                'sticky top-0 z-10 h-15 pr-2 pl-5',
                'flex items-center justify-between',
                'font-bold',
              )}
            >
              <span>Randomized Properties</span>

              <div className="flex items-center">
                <PresetButtons />
              </div>
            </div>

            <Menu
              className="py-1"
              items={enabledPropertyNames.map((propertyName) => ({
                as: Link,
                href: `/properties/${propertyName}`,
                selected: propertyName === activePropertyName,
                label: (
                  <>
                    <span>{propertyName}</span>
                    <StyledText
                      as="span"
                      variant="button.icon"
                      onClick={() => {
                        dispatch({
                          type: 'setStateByPath',
                          payload: {
                            path: `propertySettings.${propertyName}.disabled`,
                            value: true,
                          },
                        })
                      }}
                    >
                      <Icon name="solid:square-check" />
                      <span className="sr-only">Randomize</span>
                    </StyledText>
                  </>
                ),
              }))}
            />
          </div>
        )}

        <div
          id="ui-property-filter"
          className={twJoin(
            'group relative',
            'bg-bg-hover border-b-border items-center border-b px-2 py-[4px]',
          )}
        >
          <Icon
            className={twJoin(
              'absolute top-1/2 left-5 -translate-y-1/2 pt-0.5',
            )}
            name="magnifying-glass"
          />

          <input
            className={twJoin(
              'js-filter-input',
              'w-full px-10 py-1.5',
              'bg-bg text-text rounded-full border [font-size:inherit]',
              'placeholder:text-text/50',
            )}
            placeholder="Filter"
            type="search"
            onChange={(event) => setKeywords(event.target.value)}
          />

          <div
            className={twJoin(
              'absolute top-1/2 right-6 -translate-y-1/2 pt-0.5',
              'text-text-secondary text-sm',
              'group-has-[input:focus]:opacity-0',
            )}
          >
            ⌘K
          </div>
        </div>
      </div>

      <div className={twJoin('overflow-auto')}>
        {filteredGroupedPropertyNames.map(
          ([groupName, propertyNamesInGroup]) => {
            return (
              <div key={groupName}>
                <div
                  className={twJoin(
                    'sticky top-0 z-10 px-4 py-1',
                    'bg-bg-secondary text-text-secondary',
                  )}
                >
                  {groupName}
                </div>

                <Menu
                  className="py-1"
                  items={propertyNamesInGroup.map((propertyName) => {
                    const isActive = propertyName === activePropertyName

                    return {
                      as: Link,
                      href: `/properties/${propertyName}`,
                      selected: isActive,
                      className: 'group/menu-item',
                      label: (
                        <>
                          <span>{propertyName}</span>
                          <Tooltip tipContents={`Randomize ${propertyName}`}>
                            <StyledText
                              as="span"
                              variant="button.icon"
                              className={twJoin(
                                'opacity-0 transition-opacity',
                                'group-hover/sidebar:opacity-20',
                                'group-hover/menu-item:opacity-100!',
                                'hover:bg-bg-brand-hover',
                              )}
                              onClick={() => {
                                dispatch({
                                  type: 'setStateByPath',
                                  payload: {
                                    path: `propertySettings.${propertyName}.disabled`,
                                    value: false,
                                  },
                                })
                              }}
                            >
                              <Icon name="square" />
                              <span className="sr-only">Randomize</span>
                            </StyledText>
                          </Tooltip>
                        </>
                      ),
                    }
                  })}
                />
              </div>
            )
          },
        )}
      </div>
    </div>
  )
}
