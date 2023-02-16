import {FlagOutlined, SendOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Button, Input} from "antd"
import {addDoc, collection, doc, getDoc, query, where} from "firebase/firestore"
import {uniq} from "lodash"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Promisable} from "type-fest"
import type {Id} from "~/types"
import type {Comment} from "~/types/db/Comments"

import {CommentConverter} from "~/types/db/Comments"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useUser} from "~/utils/useUser"

export type CommentsProps = {
	storyMapStateId: Id
	parentId: string
	commentType: `code` | `design`
	flagged?: boolean
	onFlag?: () => Promisable<void>
}

const Comments: FC<CommentsProps> = ({storyMapStateId, parentId, commentType, flagged, onFlag}) => {
	const user = useUser()
	const [commentDraft, setCommentDraft] = useState(``)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const data: Comment = {
			text: commentDraft,
			type: commentType,
			authorId: user!.id as Id,
			parentId,
		}
		await addDoc(collection(db, `StoryMapStates`, storyMapStateId, `Comments`), data)
		setCommentDraft(``)
	}

	const [comments] = useCollection(
		query(
			collection(db, `StoryMapStates`, storyMapStateId, `Comments`),
			where(`parentId`, `==`, parentId),
			where(`type`, `==`, commentType),
		).withConverter(CommentConverter),
	)

	const commentAuthorIds = uniq(comments?.docs.map((comment) => comment.data().authorId))
	const commentAuthors = useQueries({
		queries: commentAuthorIds.map((userId) => ({
			queryKey: [`user`, userId],
			queryFn: async () => await getDoc(doc(db, `Users`, userId).withConverter(UserConverter)),
		})),
	})

	return (
		<div className="absolute inset-0 flex flex-col">
			<div className="flex grow flex-col-reverse overflow-auto">
				<div className="flex flex-col gap-4">
					{comments?.docs.length === 0 ? (
						<p className="italic text-laurel">Nothing here yet</p>
					) : (
						comments?.docs.map((comment) => {
							const author = commentAuthors.find((author) => author.data?.id === comment.data().authorId)?.data
							return (
								<div key={comment.id} className="flex gap-2">
									<Avatar shape="square" src={author?.data()?.avatar} className="border border-[#d6d7d9]" />
									<div className="flex flex-col gap-1">
										<p className="text-xs text-laurel">{author?.data()?.name}</p>
										<p>{comment.data().text}</p>
									</div>
								</div>
							)
						})
					)}
				</div>
			</div>
			<form
				onSubmit={(e) => {
					handleSubmit(e).catch(console.error)
				}}
				className="mt-4 flex gap-2"
			>
				<Avatar shape="square" src={user?.data().avatar} className="border border-[#d6d7d9]" />
				<div className="flex grow flex-col gap-2">
					<Input value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} />
					<div className="flex justify-between gap-2">
						<Button
							htmlType="submit"
							icon={<SendOutlined />}
							disabled={commentDraft.length === 0}
							className="flex items-center"
						>
							Post
						</Button>
						{flagged !== undefined && onFlag && (
							<Button
								icon={<FlagOutlined />}
								danger
								disabled={flagged}
								onClick={() => {
									if (!flagged) Promise.resolve(onFlag()).catch(console.error)
								}}
								className="flex items-center"
							>
								{flagged ? `Flagged` : `Flag`}
							</Button>
						)}
					</div>
				</div>
			</form>
		</div>
	)
}

export default Comments
