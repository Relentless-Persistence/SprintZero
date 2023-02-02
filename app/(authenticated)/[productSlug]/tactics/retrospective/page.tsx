"use client"

import {Avatar, Empty, Breadcrumb, Button} from "antd"

import type {FC} from "react"

const RetrospectivePage: FC = () => {
	return (
		<div className="flex items-start justify-between">
			<div className="w-full">
				<div className="py-[24px] px-[42px]">
					<div className="mb-4 flex items-center justify-between">
						<Breadcrumb>
							<Breadcrumb.Item>Tactics</Breadcrumb.Item>
							<Breadcrumb.Item>Retrospective</Breadcrumb.Item>
						</Breadcrumb>

						<div>
							<Button className="bg-white hover:border-none hover:text-black" onClick={() => setShowAdd(true)}>
								Add New
							</Button>
						</div>
					</div>

					{data?.length > 0 ? (
						<MasonryGrid>
							{data.map((c, i) =>
								i === activeEditIndex ? (
									<div key={i}>
										<ActionFormCard
											title={c.title}
											description={c.description}
											id={c.id}
											className="mb-[16px]"
											onCancel={() => setActiveEditIndex(null)}
											onSubmit={onEdit}
											onDelete={() => removeRetro(c.id)}
										/>
									</div>
								) : (
									<MyCard
										className="mb-[16px]"
										// extra={ user === c.name ? <CardHeaderLink>Edit</CardHeaderLink> : null }
										key={i}
									>
										<Meta
											className="flex items-center"
											avatar={
												<Avatar
													size={48}
													src={c.user?.photo}
													style={{
														border: `2px solid #315613`,
													}}
												/>
											}
											title={c.user?.name}
										/>

										{user && userRole !== `viewer` && user.id === c.user?.id ? (
											<CardHeaderLink onClick={() => editRetro(c)} className="absolute top-[28px] right-[16px]">
												Edit
											</CardHeaderLink>
										) : null}

										<article className="space-y-4">
											<div>
												<h5 className="font-semibold] text-[16px] text-[#595959]">{c.title}</h5>
												<p>{c.description}</p>
											</div>

											<div className="">
												<h5 className="font-semibold] text-[16px] text-[#595959]">Proposed Actions</h5>
												{c.actions?.map((a, actionIndex) => (
													<div key={actionIndex}>
														<AppCheckbox
															key={a.label}
															checked={a.completed}
															onChange={() => updateRetroAction(actionIndex, i, c.id)}
														>
															<span className={a.completed ? `line-through` : null}>{a.name}</span>
														</AppCheckbox>
													</div>
												))}
											</div>
										</article>

										<br />
									</MyCard>
								),
							)}
						</MasonryGrid>
					) : (
						<div className="flex items-center justify-center">
							<div
								style={{
									boxShadow: `0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)`,
								}}
								className="flex h-[187px] w-[320px] items-center justify-center rounded bg-white"
							>
								<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
							</div>
						</div>
					)}
					<AddItem
						show={showAdd}
						setShow={setShowAdd}
						user={user}
						product={activeProductId}
						type={types[activeTabIndex]}
					/>

					{selectedRetro && (
						<EditItem retro={selectedRetro} setRetro={setSelectedRetro} show={editMode} setEditMode={setEditMode} />
					)}
				</div>
			</div>

			<div className="w-auto">
				<div>
					<Versions>
						{types.map((item, i) => (
							<Version
								className={`py-[16px] px-[24px]  ${activeType === item ? `font-[600]` : ``}`}
								key={i}
								active={activeType === item}
								onClick={() => setActiveType(item)}
							>
								{item.render ? item.render() : item}
							</Version>
						))}
					</Versions>
				</div>
			</div>
		</div>
	)
}

export default RetrospectivePage
