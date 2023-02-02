import {FlagOutlined, SendOutlined} from "@ant-design/icons"
import {Avatar, Button, Input} from "antd"
import {collection, documentId, query, where} from "firebase/firestore"
import _ from "lodash"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"

import {CommentConverter, Comments as DbComments} from "~/types/db/Comments"
import {StoryMapStates} from "~/types/db/StoryMapStates"
import {UserConverter, Users} from "~/types/db/Users"
import {auth, db} from "~/utils/firebase"
import {addComment} from "~/utils/mutations"

export type CommentsProps = {
	storyMapStateId: Id
	parentId: string
	flagged?: boolean
	onFlag?: () => void
}

const Comments: FC<CommentsProps> = ({storyMapStateId, parentId, flagged, onFlag}) => {
	const [user] = useAuthState(auth)
	const [commentDraft, setCommentDraft] = useState(``)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		await addComment({
			storyMapStateId,
			comment: {
				text: commentDraft,
				type: `code`,
				authorId: user!.uid as Id,
				parentId,
			},
		})
		setCommentDraft(``)
	}

	const [comments] = useCollectionData(
		query(
			collection(db, StoryMapStates._, storyMapStateId, DbComments._),
			where(DbComments.parentId, `==`, parentId),
		).withConverter(CommentConverter),
	)

	const commentAuthorIds = _.uniq(comments?.map((comment) => comment.authorId))
	console.log(commentAuthorIds)
	const [commentAuthors] = useCollectionData(
		commentAuthorIds.length > 0
			? query(collection(db, Users._), where(documentId(), `in`, commentAuthorIds)).withConverter(UserConverter)
			: undefined,
	)

	return (
		<div className="absolute inset-0 flex flex-col">
			<div className="flex grow flex-col-reverse overflow-auto">
				<div className="space-y-4">
					{comments?.length === 0 ? (
						<p className="italic text-laurel">Nothing here yet</p>
					) : (
						comments?.map((comment) => {
							const author = commentAuthors?.find((author) => author.id === comment.authorId)
							return (
								<div key={comment.id} className="flex gap-2">
									<Avatar src={author?.avatar} />
									<div className="space-y-1">
										<p className="text-xs text-laurel">{author?.name}</p>
										<p>{comment.text}</p>
									</div>
								</div>
							)
						})
					)}
				</div>
			</div>
			<form onSubmit={handleSubmit} className="mt-4 space-y-4">
				<Input value={commentDraft} onChange={(e) => void setCommentDraft(e.target.value)} />
				<div className="flex gap-2">
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
							onClick={() => void (!flagged && onFlag())}
							className="flex items-center"
						>
							{flagged ? `Flagged` : `Flag`}
						</Button>
					)}
				</div>
			</form>
		</div>
	)
}

export default Comments
