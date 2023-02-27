/* eslint-disable react/forbid-elements */

// Please always use this component instead of an anchor tag

import Link from "next/link"
import {forwardRef} from "react"

import type {ComponentPropsWithoutRef, ForwardedRef, ReactElement, ReactNode} from "react"

export type Props = Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "rel" | "target" | "ref"> & {
	href?: string | null
	openInNewTab?: boolean
	children?: ReactNode
	noFollow?: boolean
}

const LinkTo = (
	{href, openInNewTab = false, children, noFollow, className, ...props}: Props,
	ref: ForwardedRef<HTMLAnchorElement>,
): ReactElement | null => {
	if (!href) return <p className={className}>{children}</p>

	const isInternalLink = href.startsWith(`/`) || href.startsWith(`#`) || /^https?:\/\/web\.sprintzero\.app/.test(href)
	return (
		<Link
			{...props}
			href={href}
			target={openInNewTab ? `_blank` : `_self`}
			ref={ref}
			rel={isInternalLink ? (noFollow ? `nofollow` : ``) : `noreferrer nofollow`}
			className={className}
		>
			{children}
		</Link>
	)
}

export default forwardRef(LinkTo)
