import { AppAction, AppState } from "@/lib/types"
import { Dispatch, createContext } from "react"
import { initialState } from "./initialState"

export { AppContext }
export type { AppContextObject }

interface AppContextObject {
  dispatch: Dispatch<AppAction>
  state: AppState
}

const AppContext = createContext<AppContextObject>({
  dispatch: () => {},
  state: initialState,
})
