import {createContext, useContext} from "react"

const ThemeContext = createContext<{
	theme: `light` | `auto` | `dark`
	setTheme: (value: `light` | `auto` | `dark`) => void
}>({
	theme: `auto`,
	setTheme: () => {},
})

export const ThemeProvider = ThemeContext.Provider

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useTheme = () => {
	const {theme} = useContext(ThemeContext)
	return theme
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useSetTheme = () => {
	const {setTheme} = useContext(ThemeContext)
	return setTheme
}
