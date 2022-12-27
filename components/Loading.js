import React from 'react';
import {Spin} from "antd"

const Loading = () => {
  return (
		<div className='absolute top-[50%] left-[50%] translate-x-1/2 translate-y-1/2'>
			<Spin />
		</div>
	)
}

export default Loading;
