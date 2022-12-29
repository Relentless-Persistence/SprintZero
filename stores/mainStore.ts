import create from "zustand"
import {immer} from "zustand/middleware/immer"

import type {User} from "firebase9/auth"

type MainStore = {
	user: User | null
	setUser: (user: User | null) => void
}

const useMainStore = create(
	immer<MainStore>((set) => ({
		user: null,
		setUser: (user) =>
			void set((state) => {
				state.user = user
			}),
	})),
)

export default useMainStore
