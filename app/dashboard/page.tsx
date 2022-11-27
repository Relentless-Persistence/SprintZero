"use client"

import {LeftOutlined, RightOutlined} from "@ant-design/icons"
import {useQuery} from "@tanstack/react-query"
import {Breadcrumb, Button, Menu} from "antd5"
import {useEffect, useState} from "react"

import type {ReactElement} from "react"

import useMainStore from "~/stores/mainStore"
import {getAllVersions} from "~/utils/fetch"

const StoryMap = (): ReactElement | null => {
	const activeProductId = useMainStore((state) => state.activeProductId)
	const {data: versions} = useQuery({
		queryKey: [`allVersions`, activeProductId],
		queryFn: getAllVersions(activeProductId),
		enabled: activeProductId !== null,
	})

	const [currentVersion, setCurrentVersion] = useState(``)

	useEffect(() => {
		if (currentVersion === `` && versions?.[0]) setCurrentVersion(versions[0].id)
	}, [setCurrentVersion, currentVersion, versions])

	return (
		<div className="grid grid-cols-[1fr_minmax(6rem,max-content)]">
			<div className="flex flex-col gap-8 px-12 py-8">
				<div className="flex justify-between">
					<Breadcrumb>
						<Breadcrumb.Item>Story Map</Breadcrumb.Item>
						<Breadcrumb.Item>{versions?.find((version) => version.id === currentVersion)?.version}</Breadcrumb.Item>
					</Breadcrumb>

					<Button>+ Add version</Button>
				</div>
				<div className="text-laurel">
					<div className="relative text-[0.6rem]">
						<LeftOutlined className="absolute left-[-6px] -translate-y-1/2" />
						<div className="absolute top-1/2 h-0 w-full -translate-y-1/2 border-t-[1px] border-dashed border-laurel" />
						<RightOutlined className="absolute right-[-6px] -translate-y-1/2" />
					</div>
					<div className="mt-2 flex justify-between text-xs">
						<p>Low value</p>
						<p>High value</p>
					</div>
				</div>
			</div>

			<div>
				<Menu
					selectedKeys={[currentVersion]}
					items={
						versions?.map((version) => ({
							key: version.id,
							label: version.version,
							onClick: () => void setCurrentVersion(version.id),
						})) || []
					}
				/>
			</div>
		</div>
	)
}

export default StoryMap
