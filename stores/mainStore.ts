import create from "zustand"
import {immer} from "zustand/middleware/immer"

import type {User} from "firebase9/auth"
import type {Id} from "~/types"

type MainStore = {
	user: User | null
	setUser: (user: User | null) => void
	activeProductId: Id | null
	setActiveProductId: (id: Id) => void
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
