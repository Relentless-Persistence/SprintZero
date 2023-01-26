import {FlagOutlined, SendOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Button, Input} from "antd5"
import {useAtomValue} from "jotai"
import {useState} from "react"

import type {FC} from "react"
import type {Id} from "~/types"

import {addComment} from "~/utils/api/mutations"
import {getComment, getUser} from "~/utils/api/queries"
import {userIdAtom} from "~/utils/atoms"

export type CommentsProps = {
	commentList: Id[]
	onCommentListChange: (newCommentList: Id[]) => void
	flagged?: boolean
	onFlag?: () => void
}

const Comments: FC<CommentsProps> = ({commentList, onCommentListChange, flagged, onFlag}) => {
	const userId = useAtomValue(userIdAtom)
	const [commentDraft, setCommentDraft] = useState(``)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const id = await addComment({
			comment: {
				text: commentDraft,
				type: `code`,
				authorId: userId!,
			},
		})
		onCommentListChange([...commentList, id])
		setCommentDraft(``)
	}

	const comments = useQueries({
		queries: commentList.map((comment) => ({queryKey: [`comment`, comment], queryFn: getComment(comment)})),
	})

	const commentAuthors = useQueries({
		queries: comments
			.flatMap((comment) => (comment.data ? [comment.data] : []))
			.map((comment) => ({
				queryKey: [`user`, comment.authorId],
				queryFn: getUser(comment.authorId),
			})),
	})

	return (
		<div className="absolute inset-0 flex flex-col">
			<div className="space-y-4 overflow-auto">
				{comments.length === 0 ? (
					<p className="italic text-laurel">Nothing here yet</p>
				) : (
					comments.map((comment) => {
						if (!comment.data) return null
						const author = commentAuthors.find((author) => author.data?.id === comment.data.authorId)?.data
						return (
							<div key={comment.data.id} className="flex gap-2">
								<Avatar src={author?.avatar} />
								<div className="space-y-1">
									<p className="text-xs text-laurel">{author?.name}</p>
									<p>{comment.data.text}</p>
								</div>
							</div>
						)
					})
				)}
			</div>
			<form onSubmit={handleSubmit} className="mt-4 space-y-4">
				<Input.TextArea value={commentDraft} onChange={(e) => void setCommentDraft(e.target.value)} />
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
