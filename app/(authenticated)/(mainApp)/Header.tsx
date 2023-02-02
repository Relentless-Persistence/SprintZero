import {CloseOutlined} from "@ant-design/icons"
import {Avatar, Drawer, Layout, Menu} from "antd"
import {collection, doc, query, where} from "firebase/firestore"
import Image from "next/image"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useCollectionDataOnce, useDocumentData} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC} from "react"

import SettingsMenu from "./SettingsMenu"
import LinkTo from "~/components/LinkTo"
import {ProductConverter, Products} from "~/types/db/Products"
import {auth, db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const Header: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))

	const [user] = useAuthState(auth)
	invariant(user, `User state not loaded`)
	const [allProducts] = useCollectionDataOnce(
		query(collection(db, Products._), where(`${Products.members}.${user.uid}.type`, `==`, `editor`)).withConverter(
			ProductConverter,
		),
	)

	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	return (
		<>
			<Layout.Header style={{paddingInline: `unset`}}>
				<div id="dashboard" className="flex h-full items-center gap-8 bg-pine px-[17.45px]">
					<Image src="/images/logo_beta.png" alt="SprintZero logo" width={178} height={42} priority />

					<Menu
						theme="dark"
						mode="horizontal"
						selectedKeys={[activeProduct?.id ?? ``]}
						items={allProducts?.map((product) => ({
							key: product.id,
							label: (
								<LinkTo href={`/${product.id}/dashboard`} className="relative">
									{product.name}
								</LinkTo>
							),
						}))}
						className="grow [&>.ant-menu-item-selected]:shadow-[inset_0px_-4px_0px_0px_#73c92d]"
						style={{background: `transparent`}}
					/>

					<button type="button" onClick={() => void setIsSettingsOpen(true)}>
						<Avatar src={user.photoURL} className="border-2 border-green" />
					</button>
				</div>
			</Layout.Header>

			<Drawer
				title="Settings"
				closable={false}
				width="192px"
				open={isSettingsOpen}
				onClose={() => void setIsSettingsOpen(false)}
				extra={
					<button type="button" onClick={() => void setIsSettingsOpen(false)}>
						<CloseOutlined />
					</button>
				}
				bodyStyle={{padding: `12px`}}
			>
				<SettingsMenu />
			</Drawer>
		</>
	)
}

export default Header
