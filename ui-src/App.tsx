import { useReducer, useRef } from "react"
import { twMerge } from "tailwind-merge"
import "./App.css"
import { Icon } from "./components/Icon"

interface AppState {
  activeRouteName: "properties" | "saved" | "about"
}

type AppAction = {}

const initialState: AppState = {
  activeRouteName: "properties",
}

const AppReducer = (state: AppState, action: AppAction) => {
  return state
}

function App() {
  const [state, dispatch] = useReducer(AppReducer, initialState)

  const { activeRouteName } = state

  const onCreate = () => {
    parent.postMessage(
      { pluginMessage: { type: "create-rectangles", count: 1 } },
      "*",
    )
  }

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*")
  }

  return (
    <main
      className="
        h-screen
        bg-neutral-200
        font-[Inter,sans-serif]
        tracking-wider
      "
    >
      <header
        className="
          border-b
          bg-white
          px-5
          py-2
        "
      >
        <nav className="flex justify-between">
          <ul className="flex gap-3">
            <li>
              <a
                className={twMerge(
                  "font-bold",
                  activeRouteName !== "properties" && "text-fadedTextColor",
                )}
                href="#"
              >
                Properties
              </a>
            </li>
            <li>
              <a
                className={twMerge(
                  "font-bold",
                  activeRouteName !== "saved" && "text-fadedTextColor",
                )}
                href="#"
              >
                Saved
              </a>
            </li>
          </ul>

          <a
            className={twMerge(
              "font-bold",
              activeRouteName !== "about" && "text-fadedTextColor",
            )}
            href="#"
          >
            About
          </a>
        </nav>
      </header>

      <section></section>

      <footer
        className="
          fixed
          bottom-0
          left-0
          right-0
        "
      >
        <button
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            bg-sky-500
            px-5
            py-2
            font-bold
            tracking-[inherit]
            text-white
            hover:bg-sky-400
            active:bg-sky-600
          "
          onClick={onCreate}
        >
          Execute
          <Icon name="shuffle" />
        </button>
      </footer>
    </main>
  )
}

export default App
