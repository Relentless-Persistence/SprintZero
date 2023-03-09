import {doc, setDoc} from "firebase/firestore"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocument} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {User} from "~/types/db/Users"

import {auth, db} from "./firebase"
import {UserConverter} from "~/types/db/Users"

export const useUser = (): QueryDocumentSnapshot<User> | undefined => {
	const [user] = useAuthState(auth)
	invariant(user, `User is not logged in`)

	const [dbUser, loading] = useDocument(doc(db, `Users`, user.uid).withConverter(UserConverter))

	if (loading) {
		return undefined
	} else {
		if (dbUser?.exists()) {
			return dbUser
		} else {
			invariant(user.email, `User has no email`)
			invariant(user.displayName, `User has no name`)

			setDoc(doc(db, `Users`, user.uid).withConverter(UserConverter), {
				avatar: user.photoURL,
				email: user.email,
				hasAcceptedTos: false,
				name: user.displayName,
				preferredMusicClient: `appleMusic`,
			}).catch(console.error)

			return undefined
		}
	}
}
