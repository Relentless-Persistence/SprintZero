import {doc} from "firebase/firestore"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocumentData} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {WithDocumentData} from "~/types"
import type {User} from "~/types/db/Users"

import {auth, db} from "./firebase"
import {UserConverter, Users} from "~/types/db/Users"

export const useUser = (): WithDocumentData<User> | undefined => {
	const [user] = useAuthState(auth)
	invariant(user, `User is not logged in`)

	const [dbUser, loading] = useDocumentData(doc(db, Users._, user.uid).withConverter(UserConverter))

	if (loading) {
		return undefined
	} else {
		invariant(dbUser, `User is not in the database`)
		return dbUser
	}
}
