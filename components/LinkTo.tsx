/* eslint-disable react/forbid-elements */

// Please always use this component instead of an anchor tag

import Link from "next/link"
import {forwardRef} from "react"

import type {LinkProps} from "next/link"
import type {ForwardedRef, ReactNode, ReactElement} from "react"

export type Props = Omit<JSX.IntrinsicElements["a"], "href" | "rel" | "target" | "ref"> & {
	href?: string | null
	openInNewTab?: boolean
	linkProps?: Omit<LinkProps, "passHref" | "href">
	children?: ReactNode
	noFollow?: boolean
}

const LinkTo = (
	{href, openInNewTab = false, linkProps, children, noFollow, className, ...props}: Props,
	ref: ForwardedRef<HTMLAnchorElement>,
): ReactElement | null => {
	if (!href) return <>{children}</>

	const isInternalLink = href.startsWith(`/`) || href.startsWith(`#`) || /^https?:\/\/web\.sprintzero\.app/.test(href)
	if (isInternalLink) {
		return (
			<Link {...linkProps} href={href} passHref>
				<a
					{...props}
					target={openInNewTab ? `_blank` : `_self`}
					ref={ref}
					rel={noFollow ? `nofollow` : ``}
					className={className}
				>
					{children}
				</a>
			</Link>
		)
	} else {
		return (
			<a
				{...props}
				href={href}
				target={openInNewTab ? `_blank` : `_self`}
				rel="noreferrer nofollow"
				className={className}
			>
				{children}
			</a>
		)
	}
}

export default forwardRef(LinkTo)
