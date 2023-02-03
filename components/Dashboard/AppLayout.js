import React, {useState} from "react"
import styled from "styled-components"
import {Layout, Breadcrumb, Input, Divider, Button} from "antd"

import SideBar from "./SideBar"
import AppHeader from "./Header"
import withAuth from "../../hoc/withAuth"

const {Content, Sider} = Layout

const Versions = styled.ul`
	list-style: none;
	color: #262626;
	font-size: 16px;
`

const Version = styled.li`
	border-left-width: 4px;
	border-left-style: solid;
	border-left-color: ${(props) => (props.active ? "#315613" : "#3156131a")};
	cursor: pointer;
	padding-bottom: 28px;
	font-style: normal;
	font-weight: 400;
	font-size: 16px;
	line-height: 24px;
`

const AddNew = styled(Button)`
	align-items: center;
	display: flex;
	margin-left: 10px;
	background: #fff;
	overflow: hidden;
`

const AddSide = styled(Button)`
	background: transparent !important ;
	border: none;
	color: #262626 !important ;
	box-shadow: none;
	font-size: 16px;
	line-height: 24px;
	margin: 0;
	padding: 0;
	text-align: start;
	font-weight: 600;
`

const capitalize = (text) => `${text[0]?.toUpperCase()}${text?.substring(1).toLowerCase()}`

const AppLayout = ({
	rightNavItems = [],
	activeRightItem,
	breadCrumbItems = [],
	setActiveRightNav,
	onChangeProduct,
	onMainAdd,
	hasMainAdd,
	defaultText,
	onSideAdd,
	hasSideAdd = true,
	hideSideBar = false,
	ignoreLast,
	type,
	addNewText = "Add New",
	addNewClass,
	capitalizeText = true,
	versionClass,
	contentClass = "",
	topExtra = <></>,
	useGrid,
	mainClass,
	breadCrumbClass,
	sideBarClass,
	sideAddValue,
	setSideAddValue,
	onSideAddClick,
	children,
}) => {
	const {user, userRole} = useAuth()
	const [showSideAdd, setShowSideAdd] = useState(false)

	const [value, setValue] = useState("")

	const toggleSideAdd = () => {
		setShowSideAdd((s) => !s)
	}

	const onEnter = (e) => {
		if (e.key === "Enter") {
			onSideAdd()
			toggleSideAdd()
			setSideAddValue("")
		}
	}

	const handleChange = (e) => {
		setValue(e.target.value)
	}

	//if ( !user ) return <div>Loading...</div>;

	return (
		<Layout style={{minHeight: "100vh"}}>
			<AppHeader onChangeProduct={onChangeProduct} />
			<Layout>
				<Sider
					width={200}
					className="site-layout-background"
					breakpoint="sm"
					style={{
						position: "fixed",
						zIndex: 1,
						height: "100%",
						marginTop: "64px",
					}}
				>
					<SideBar />
				</Sider>
				<Layout
					className={mainClass}
					style={{
						marginTop: "70px",
						marginLeft: "200px",
					}}
				>
					<div
						style={
							useGrid
								? {
										display: "grid",
										"grid-template-columns": "minmax(0,1fr) auto",
								  }
								: {}
						}
						className={useGrid ? null : "flex justify-between"}
					>
						<div className={`flex-1 pt-[24px] pl-[42px] pr-[33px]`}>
							<div className={`flex items-center justify-between ${breadCrumbClass}`}>
								<Breadcrumb>
									{breadCrumbItems.map((item, i) => (
										<Breadcrumb.Item className="capitalize" key={i}>
											{item}
										</Breadcrumb.Item>
									))}

									{ignoreLast ? null : (
										<Breadcrumb.Item className="text-green-800 ">
											{capitalizeText ? defaultText || activeRightItem : defaultText || activeRightItem}
										</Breadcrumb.Item>
									)}
								</Breadcrumb>

								{userRole && userRole !== "viewer" ? (
									<div className="flex items-center justify-between">
										{<div>{topExtra}</div>}

										{hasMainAdd ? (
											<AddNew className={addNewClass} onClick={onMainAdd}>
												{addNewText}
											</AddNew>
										) : null}
									</div>
								) : null}
							</div>

							<Content className={`m-0 px-0 pt-[12px] ${contentClass}`}>{children}</Content>
						</div>

						{hideSideBar ? null : (
							<div
							//style={ { minWidth: "180px" } }
							>
								<div
									className={`fixed right-0 z-[500] max-h-full min-h-full min-w-[50px] overflow-y-auto bg-[#F0F2F5] pb-[80px] ${sideBarClass}`}
								>
									<Versions>
										{rightNavItems.map((item, i) => (
											<Version
												className={`py-[16px] px-[24px] ${versionClass || ""} ${
													activeRightItem === (item.value || item) ? "font-[600]" : ""
												}`}
												key={i}
												active={activeRightItem === (item.value || item)}
												onClick={() => setActiveRightNav(item.value ? item.value : item)}
											>
												{item.render ? item.render() : item}
											</Version>
										))}

										{hasSideAdd && showSideAdd ? (
											<Version className={`py-[16px] px-[24px] ${versionClass || ""}`}>
												<Input
													className="mx-0 my-0 "
													type={type || "number"}
													maxLength={15}
													autoFocus
													value={sideAddValue}
													onChange={(e) => setSideAddValue(e.target.value)}
													onKeyPress={onEnter}
													style={{maxWidth: "90px"}}
												/>
											</Version>
										) : null}

										{hasSideAdd && onSideAddClick && userRole && userRole !== "viewer" ? (
											<Version className="py-[16px] px-[24px]">
												<AddSide onClick={onSideAddClick}>Add</AddSide>
											</Version>
										) : null}

										{hasSideAdd && !onSideAddClick ? (
											<Version className="py-[16px] px-[24px]">
												<AddSide onClick={toggleSideAdd}>{showSideAdd ? "Close" : "Add"}</AddSide>
											</Version>
										) : null}
									</Versions>
								</div>
							</div>
						)}
					</div>
				</Layout>
			</Layout>
		</Layout>
	)
}

export default withAuth(AppLayout)
