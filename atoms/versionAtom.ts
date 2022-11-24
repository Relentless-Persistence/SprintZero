import {atom} from "recoil"

type Version = {
	id?: string
	version?: string
}

export const versionState = atom<Version | null>({
	key: `versionState`,
	default: null,
})
