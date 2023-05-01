import { SendOutlined } from "@ant-design/icons"
import { Avatar, Button } from "antd"
import { addDoc, collection, orderBy, query, serverTimestamp } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import { Mention, MentionsInput } from "react-mentions";

import type { FC, SetStateAction } from "react"
import type { Comment } from "~/types/db/Products/StoryMapItems/Comments"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { MemberConverter } from "~/types/db/Products/Members"

export type CommentsProps = {
  id: string
}

type memberDocs = {
  id: string;
  type: "owner" | "editor" | "viewer";
  name: string;
  avatar: string | null;
}

type MentionData = {
  id: string;
  display: string;
};

const mentionStyle = {
  control: {
    backgroundColor: `#fff`,
    fontSize: 14,
    fontWeight: `normal`,
  },

  '&multiLine': {
    control: {
      minHeight: 63,
    },
    highlighter: {
      padding: 9,
      border: `1px solid transparent`,
    },
    input: {
      padding: 9,
      border: `1px solid silver`,
    },
  },

  '&singleLine': {
    display: `inline-block`,
    width: 180,

    highlighter: {
      padding: 1,
      border: `2px inset transparent`,
    },
    input: {
      padding: 1,
      border: `2px inset`,
    },
  },

  suggestions: {
    list: {
      backgroundColor: `white`,
      border: `1px solid rgba(0,0,0,0.15)`,
      fontSize: 14,
    },
    item: {
      padding: `5px 15px`,
      borderBottom: `1px solid rgba(0,0,0,0.15)`,
      '&focused': {
        backgroundColor: `#cee4e5`,
      },
    },
  },
}

const Comments: FC<CommentsProps> = ({ id }) => {
  const { product, user } = useAppContext()
  const [commentDraft, setCommentDraft] = useState(``)
  const [mentions, setMentions] = useState<MentionData[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data: Partial<Comment> = {
      createdAt: serverTimestamp(),
      text: commentDraft,
      authorId: user.id,
    }
    await addDoc(collection(product.ref, `Tasks`, id, `Comments`), data)
    setCommentDraft(``)
  }

  const [comments, , commentsError] = useCollection(
    query(
      collection(product.ref, `Tasks`, id, `Comments`),
      orderBy(`createdAt`, `asc`),
    ),
  )
  useErrorHandler(commentsError)


  const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
  useErrorHandler(membersError)

  useEffect(() => {
    if (members) {
      const memberDocs: memberDocs[] = members.docs.map((doc) => doc.data())

      if (memberDocs.length) {
        const commentUsers: MentionData[] = memberDocs.map((member) => ({
          id: member.id,
          display: `@${member.name}`,
        }));

        setMentions(commentUsers)
      }
    }
  }, [members])

  return (
    <div className="">
      <div className="flex grow flex-col-reverse overflow-auto">
        <div className="flex flex-col gap-4">
          {comments?.docs.length === 0 ? (
            <p className="italic leading-normal text-textTertiary">Nothing here yet</p>
          ) : (
            comments?.docs.map((comment) => {
              const author = members?.docs.find((member) => member.id === comment.data().authorId)
              return (
                <div key={comment.id} className="flex gap-2">
                  <Avatar shape="square" src={author?.data()?.avatar} className="border border-border" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-sm font-medium">
                      {author?.data()?.name}
                    </p>
                    <p className="leading-normal">{comment.data().text}</p>
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
        <Avatar
          shape="square"
          src={members?.docs.find((member) => member.id === user.id)!.data().avatar}
          className="border border-border"
        />
        <div className="flex grow flex-col gap-2">

          <MentionsInput value={commentDraft} onChange={(e: { target: { value: SetStateAction<string> } }) => setCommentDraft(e.target.value)} style={mentionStyle}>
            <Mention
              trigger="@"
              className="text-primary bg-primaryBg"
              data={mentions}
              renderSuggestion={(member, search, highlightedDisplay) => (
                <div className="border-b-primaryBorder focus:bg-primaryBg">
                  {highlightedDisplay}
                </div>
              )}
              appendSpaceOnAdd
              markup="@*__display__*"
            />
          </MentionsInput>

          {/* <Input value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} /> */}
          <div className="flex justify-between gap-2">
            <Button
              htmlType="submit"
              icon={<SendOutlined />}
              disabled={commentDraft.length === 0}
              className="flex items-center"
            >
              Post
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Comments