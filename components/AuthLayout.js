import React from "react";
import { Typography, Avatar, Image, List } from "antd";
const { Title, Text } = Typography;
import { useAuth } from "../contexts/AuthContext";

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
		<div className="mb-8" style={{padding: "50px 153px"}}>
			<div className="flex items-center justify-between">
				<Image src="/images/logo_beta_light.png" alt="Logo" className="h-[42px] w-[178px]" preview={false} />
				{user ? (
					<div className="">
						<List className="w-[200px]">
							<List.Item>
								<List.Item.Meta
									avatar={<Avatar size="large" src={user.photoURL} />}
									title={user.displayName}
									description={user.email}
								/>
							</List.Item>
						</List>
					</div>
				) : null}
			</div>

			{children}
		</div>
	)
};

export default Layout;
