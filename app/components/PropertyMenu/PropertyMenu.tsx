import { Icon } from "@/app/components/Icon"
import { IconButton } from "@/app/components/IconButton"
import { AppContext } from "@/app/reducer"
import { PropertyName } from "@/lib/pluginTypes"
import { sortBy } from "lodash"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ComponentPropsWithoutRef,
  MouseEvent,
  useContext,
  useEffect,
  useState,
} from "react"
import { twMerge } from "tailwind-merge"
import { classNames } from "./classNames"
import { groupedPropertyNames } from "./groupedPropertyNames"

export { PropertyMenu }

interface PropertyMenuProps
  extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {}

const PropertyMenu = ({ className, ...otherProps }: PropertyMenuProps) => {
  const {
    state: { propertySettings },
  } = useContext(AppContext)

  const [keywords, setKeywords] = useState("")

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && event.metaKey) {
        event.preventDefault()
        event.stopPropagation()

        const inputElement = document.querySelector(
          ".js-filter-input",
        ) as HTMLInputElement

        inputElement.select()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const propertyOptions = Object.entries(propertySettings) as [
    PropertyName,
    any,
  ][]

  const [unSortedRandomizedProperties, unSortedUnrandomizedProperties] =
    propertyOptions.reduce(
      (acc, propertyOption) => {
        const [, { isRandomized }] = propertyOption

        acc[isRandomized ? 0 : 1].push(propertyOption)

        return acc
      },
      [[], []] as [[PropertyName, any][], [PropertyName, any][]],
    )

  const randomizedProperties = sortBy(
    unSortedRandomizedProperties,
    ([propertyName]) => propertyName,
  )

  const filteredGroupedPropertyNames = groupedPropertyNames.reduce(
    (acc, [groupName, propertyNames]) => {
      const unrandomizedOnly = propertyNames.filter(
        (propertyName) => propertySettings[propertyName].isRandomized === false,
      )

      const filteredPropertyNames = keywords
        ? unrandomizedOnly.filter((propertyName) =>
            propertyName.toLowerCase().includes(keywords.toLowerCase()),
          )
        : unrandomizedOnly

      if (filteredPropertyNames.length > 0) {
        acc.push([groupName, filteredPropertyNames])
      }

      return acc
    },
    [] as [string, PropertyName[]][],
  )

  return (
    <nav
      className={twMerge(classNames.container, className)}
      {...otherProps}
    >
      <div className={classNames.containerForRandomizedProperties}>
        {randomizedProperties.map(([propertyName]) => (
          <PropertyMenuButton
            key={propertyName}
            propertyName={propertyName}
          />
        ))}
      </div>

      <div className={classNames.containerForUnrandomizedProperties}>
        {filteredGroupedPropertyNames.map(([groupName, propertyNames]) => (
          <div key={groupName}>
            <div className={classNames.groupHeading}>{groupName}</div>
            {propertyNames.map((propertyName) => (
              <PropertyMenuButton
                key={propertyName}
                propertyName={propertyName}
              />
            ))}
          </div>
        ))}
      </div>

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
    </nav>
  )
}

function PropertyMenuButton({ propertyName }: { propertyName: PropertyName }) {
  const {
    dispatch,
    state: { propertySettings },
  } = useContext(AppContext)

  const { propertyName: activePropertyName } = useParams()

  const isPropertyRouteActive = activePropertyName === propertyName

  const { isRandomized } = propertySettings[propertyName]

  function handleClickRandomizeProperty(
    args: { propertyName: PropertyName },
    event: MouseEvent<HTMLElement>,
  ) {
    event.preventDefault()

    const { propertyName } = args

    dispatch({
      type: "setIsRandomized",
      payload: {
        propertyName,
        isRandomized: !isRandomized,
      },
    })
  }

  return (
    <Link
      className={classNames.propertyButton({
        isPropertyRouteActive,
        isRandomized,
      })}
      href={`/properties/${propertyName}`}
      id={propertyName}
      key={propertyName}
      onDoubleClick={handleClickRandomizeProperty.bind(null, {
        propertyName,
      })}
    >
      {propertyName}

      <IconButton
        as="div"
        className={classNames.checkbox({
          isPropertyRouteActive,
          isRandomized,
        })}
        iconName={isRandomized ? "square-check" : "square"}
        iconVariant={isRandomized ? "solid" : undefined}
        label="Toggle Randomization of this Property"
        variant={isPropertyRouteActive ? "primary" : undefined}
        onClick={handleClickRandomizeProperty.bind(null, {
          propertyName,
        })}
      />
    </Link>
  )
}
