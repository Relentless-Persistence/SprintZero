import create from "zustand"
import {immer} from "zustand/middleware/immer"

import type {User} from "firebase9/auth"

type MainStore = {
	user: User | null
	setUser: (user: User | null) => void
	activeProductId: string | null
	setActiveProductId: (id: string) => void
}

const useMainStore = create(
	immer<MainStore>((set) => ({
		user: null,
		setUser: (user) =>
			void set((state) => {
				state.user = user
			}),
		activeProductId: null,
		setActiveProductId: (id) =>
			void set((state) => {
				state.activeProductId = id
			}),
	})),
)

export default useMainStore
