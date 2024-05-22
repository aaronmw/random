import { Button } from "@/app/components/Button"
import { Icon } from "@/app/components/Icon"
import { Randy } from "@/app/components/Randy"
import { AppContext } from "@/app/reducer"
import { PropertyName } from "@/lib/types"
import { ComponentProps, useContext, useState } from "react"
import { FieldContainerProps } from "./FieldContainer"
import { ListInputField } from "./ListInputField"

export { ListInputFieldForStrings }

interface ListInputFieldForStringsProps
  extends Omit<ComponentProps<"textarea">, "type">,
    Pick<FieldContainerProps, "label" | "variant"> {
  propertyName: PropertyName
}

function ListInputFieldForStrings({
  label,
  propertyName,
}: ListInputFieldForStringsProps) {
  const { dispatch } = useContext(AppContext)

  const [isShowingRandy, setIsShowingRandy] = useState(false)

  return (
    <>
      <ListInputField
        label={label}
        propertyName={propertyName}
        renderBottomSlot={
          process.env.NODE_ENV === "development" && (
            <div className="mt-1 flex justify-end">
              <Button
                className="
                  flex
                  items-center
                  gap-1
                "
                variant="link"
                onClick={() => setIsShowingRandy(true)}
              >
                <Icon
                  name="robot"
                  variant="solid"
                />
                Randy
              </Button>
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
            type: "setStateByPath",
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
