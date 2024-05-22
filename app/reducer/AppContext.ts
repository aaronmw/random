import { AppAction, AppState } from "@/lib/pluginTypes"
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
