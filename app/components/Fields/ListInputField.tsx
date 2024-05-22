import { Badge } from "@/app/components/Badge"
import { Box } from "@/app/components/Box"
import { Icon } from "@/app/components/Icon"
import { AppContext } from "@/app/reducer"
import { PropertyName } from "@/lib/types"
import { get } from "lodash"
import {
  FocusEvent,
  FocusEventHandler,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { FieldContainer } from "./FieldContainer"

interface ListInputFieldProps {
  label: ReactNode
  propertyName: PropertyName
  renderBottomSlot?: ReactNode
  renderLeftSlot?: (context: {
    isValid: boolean
    lineIndex: number
    setValues: (values: string[]) => void
    value: string
    values: string[]
  }) => ReactNode
  validatorFunction: (value: string) => string | true
}

const classNames = {
  labelContainer: twJoin(
    `
      flex
      items-center
      justify-between
    `,
  ),

  badgesContainer: twJoin(
    `
      flex
      gap-1
    `,
  ),

  container: twJoin(
    `
      w-full
    `,
  ),

  listContainer: twJoin(
    `
      group/list
      relative
      grid
      w-full
      grid-flow-col
      grid-cols-[min-content,1fr,min-content]
      grid-rows-[max-content]
      overflow-hidden
      leading-none
    `,
  ),

  leftSlotContainer: twJoin(
    `
      col-start-1
      col-end-2
    `,
  ),

  textArea: twJoin(
    `
      col-start-2
      col-end-3
      row-start-1
      row-end-[9999]
      resize-none
      border-0
      bg-transparent
      pl-2
      font-mono
      leading-6
      text-textColor
      outline-none
    `,
  ),

  valueContainer: ({ isCommentedOut = false, isValid = false }) =>
    twMerge(
      `
        col-start-2
        col-end-3
        flex
        h-6
        w-full
        flex-shrink-0
        cursor-pointer
        items-center
        pl-2
        font-mono
        leading-none
        transition-opacity
        hover:!text-textColor
        group-hover/list:text-fadedTextColor
      `,
      isValid
        ? "odd:bg-shadedBgColor"
        : isCommentedOut
          ? `
              bg-shadedBgColor/20
              odd:bg-shadedBgColor/40
              text-fadedTextColor
            `
          : `
              bg-red-500/10
              text-red-600
              odd:bg-red-500/20
            `,
    ),

  rightSlotContainer: ({
    isCommentedOut = false,
    isEditing = false,
    isValid = false,
    lineIndex = 0,
  }) =>
    twMerge(
      `
        group/list-item
        relative
        col-start-3
        col-end-4
        flex
        h-6
        items-center
        justify-end
        px-2
        leading-none
      `,
      // Can't use `odd:` because the number of children
      // changes when editing
      lineIndex % 2 === 0 && `is-odd`,
      isEditing &&
        `
          before:absolute
          before:right-full
          before:-z-10
          before:col-start-2
          before:col-end-4
          before:h-full
          before:w-screen
        `,
      isValid
        ? `
            [&.is-odd]:bg-shadedBgColor
            [&.is-odd]:before:bg-shadedBgColor
          `
        : isCommentedOut
          ? `
              bg-shadedBgColor/20
              before:bg-shadedBgColor/20
              [&.is-odd]:bg-shadedBgColor/40
              [&.is-odd]:before:bg-shadedBgColor/40
              text-fadedTextColor
            `
          : `
              bg-red-500/10
              text-red-600
              before:bg-red-500/10
              [&.is-odd]:bg-red-500/20
              [&.is-odd]:before:bg-red-500/20
            `,
    ),

  rightSlotStatusIcon: ({ isCommentedOut = false, isValid = false }) =>
    twMerge(
      `
        transition-all
      `,
      isValid &&
        `
          opacity-0
          group-hover/list-item:opacity-100
        `,
      isCommentedOut &&
        `
          opacity-30
          group-hover/list-item:opacity-100
        `,
    ),
}

export function ListInputField({
  label,
  propertyName,
  renderLeftSlot,
  renderBottomSlot,
  validatorFunction,
}: ListInputFieldProps) {
  const [isEditing, setIsEditing] = useState(false)

  const [scrollTop, setScrollTop] = useState<number | null>(null)

  const [clickedLineIndex, setClickedLineIndex] = useState<number | null>(null)

  const { dispatch, state } = useContext(AppContext)

  const path = `propertySettings.${propertyName}.modeOptions.list.options`

  const values = get(state, path) as string[]

  const [metaDataByLineIndex, setMetaDataByLineIndex] = useState<
    (string | true)[]
  >([])

  useEffect(() => {
    setMetaDataByLineIndex(
      values.map((value) =>
        String(value).startsWith("//") ? true : validatorFunction(value),
      ),
    )
  }, [validatorFunction, values])

  useEffect(() => {
    const scrollingElement = scrollingElementRef.current

    if (!scrollingElement) return

    const handleScroll = () => setScrollTop(scrollingElement.scrollTop)

    scrollingElement.addEventListener("scroll", handleScroll)

    return () => {
      scrollingElement.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (isEditing) {
      const scrollingElement = scrollingElementRef.current
      const textareaElement = textareaElementRef.current

      if (scrollingElement && scrollTop) {
        scrollingElement.scrollTo(0, scrollTop)
      }

      if (textareaElement && clickedLineIndex !== null) {
        const startingIndex = values
          .slice(0, clickedLineIndex)
          .reduce((totalOffset, value) => totalOffset + value.length + 1, 0)

        const endingIndex = startingIndex + values[clickedLineIndex].length

        textareaElement.setSelectionRange(startingIndex, endingIndex)

        setClickedLineIndex(null)
      }
    }
  }, [clickedLineIndex, isEditing, scrollTop, values])

  const scrollingElementRef = useRef<HTMLDivElement>(null)
  const textareaElementRef = useRef<HTMLTextAreaElement>(null)

  function startEditingLineIndex({ lineIndex }: { lineIndex: number }) {
    setClickedLineIndex(lineIndex)
    setIsEditing(true)
  }

  function stopEditing() {
    setIsEditing(false)
  }

  function handleChange(event: { target: { value: string } }) {
    const { value } = event.target
    const newValues = value.split("\n")
    setValues(newValues)
  }

  function handleClickToggleComment(args: { lineIndex: number }) {
    const { lineIndex } = args
    setValues(
      values.map((value, index) =>
        index === lineIndex
          ? value.startsWith("//")
            ? value.replace(/^\/\/\s*/, "")
            : `// ${value}`
          : value,
      ),
    )
  }

  // Re-enable CMD+A to select all text in textarea
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "a" && event.metaKey) {
      textareaElementRef.current?.select()
    }
  }

  function setValues(values: string[]) {
    dispatch({
      type: "setStateByPath",
      payload: {
        path,
        value: values,
      },
    })
  }

  const numDisabledValues = values.filter((value) =>
    String(value).startsWith("//"),
  ).length

  const errorMessages = metaDataByLineIndex.filter(
    (metaData) => typeof metaData === "string",
  )

  return (
    <FieldContainer
      label={
        <div className={classNames.labelContainer}>
          {label}

          <div className={classNames.badgesContainer}>
            <Badge title="Number of Valid Values">
              <Icon
                name="check"
                variant="solid"
              />{" "}
              {metaDataByLineIndex.length -
                errorMessages.length -
                numDisabledValues}
            </Badge>

            {errorMessages.length >= 1 && (
              <Badge
                title="Number of Invalid Values"
                variant="danger"
              >
                <Icon
                  name="triangle-exclamation"
                  variant="solid"
                />{" "}
                {errorMessages.length}
              </Badge>
            )}

            {numDisabledValues >= 1 && (
              <Badge title="Number of Disabled Values">
                {"// "}
                {numDisabledValues}
              </Badge>
            )}
          </div>
        </div>
      }
      variant="labelOnTop"
    >
      <div className={classNames.container}>
        <div
          className={classNames.listContainer}
          ref={scrollingElementRef}
        >
          {typeof renderLeftSlot === "function" &&
            values.map((value, lineIndex) => {
              const isValid = metaDataByLineIndex[lineIndex] === true
              return (
                <Box
                  className={classNames.leftSlotContainer}
                  key={`${value}-${lineIndex}`}
                  variant="contentCentered"
                >
                  {renderLeftSlot({
                    isValid,
                    lineIndex,
                    setValues,
                    value,
                    values,
                  })}
                </Box>
              )
            })}

          {isEditing ? (
            <textarea
              className={classNames.textArea}
              spellCheck={false}
              ref={textareaElementRef}
              rows={values.length}
              value={values.join("\n")}
              onKeyDown={handleKeyDown}
              onBlur={stopEditing}
              onChange={handleChange}
            />
          ) : (
            values.map((value, lineIndex) => {
              const isCommentedOut = String(value).startsWith("//")

              const isValid =
                !isCommentedOut &&
                (typeof metaDataByLineIndex[lineIndex] === "undefined" ||
                  metaDataByLineIndex[lineIndex] === true)

              return (
                <div
                  className={classNames.valueContainer({
                    isValid,
                    isCommentedOut,
                  })}
                  key={lineIndex}
                  onClick={startEditingLineIndex.bind(null, {
                    lineIndex,
                  })}
                >
                  {value}
                </div>
              )
            })
          )}

          {values.map((value, lineIndex) => {
            const isCommentedOut = String(value).startsWith("//")

            const isValid =
              !isCommentedOut &&
              (typeof metaDataByLineIndex[lineIndex] === "undefined" ||
                metaDataByLineIndex[lineIndex] === true)

            return (
              <div
                className={classNames.rightSlotContainer({
                  isCommentedOut,
                  isEditing,
                  isValid,
                  lineIndex,
                })}
                key={lineIndex}
                title={
                  isCommentedOut
                    ? "Enable"
                    : isValid
                      ? "Disable"
                      : `Invalid: ${metaDataByLineIndex[lineIndex]}`
                }
                onClick={handleClickToggleComment.bind(null, {
                  lineIndex,
                })}
              >
                <Icon
                  className={classNames.rightSlotStatusIcon({
                    isCommentedOut,
                    isValid,
                  })}
                  name={
                    isCommentedOut
                      ? "eye"
                      : isValid
                        ? "eye-slash"
                        : "triangle-exclamation"
                  }
                  variant="solid"
                />
              </div>
            )
          })}
        </div>

        {renderBottomSlot}
      </div>
    </FieldContainer>
  )
}
