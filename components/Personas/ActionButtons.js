import React, { useState } from "react";
import { Button } from "antd5";

const ActionButtons = ( {
    onCancel, onSubmit, className
} ) =>
{
    return (
			<div className="ml-4 flex items-center space-x-2">
				<Button size="small" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="primary" size="small" className="bg-green-s500" onClick={onSubmit}>
					Done
				</Button>
			</div>
		)
};

export const LightActionButtons = ( {
    onCancel, onSubmit, className
} ) =>
{
    return (
			<div className="ml-4 flex items-center space-x-2">
				<Button size="small" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="primary" size="small" className="bg-green-s500" onClick={onSubmit}>
					Done
				</Button>
			</div>
		)
};

export default ActionButtons;
