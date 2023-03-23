import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { FC } from "react"

const Flow: FC = () => {

  const data = [
    {
      name: `March`,
      "Release Backlog": 4000,
      "Sprint Backlog / Design": 2400,
      Designing: 2400,
      Prototyping: 2300,
      "Ready for Dev": 6754,
      Developing: 2800,
      "User Acceptance Testing": 2309,
      Shipped: 1000
    },
    {
      name: `April`,
      "Release Backlog": 4500,
      "Sprint Backlog / Design": 3200,
      Designing: 2800,
      Prototyping: 2700,
      "Ready for Dev": 7900,
      Developing: 2800,
      "User Acceptance Testing": 2900,
      Shipped: 1500
    },
    {
      name: `May`,
      "Release Backlog": 5000,
      "Sprint Backlog / Design": 3600,
      Designing: 3200,
      Prototyping: 3100,
      Developing: 3200,
      "Ready for Dev": 7900,
      "User Acceptance Testing": 3300,
      Shipped: 2500
    },
    {
      name: `June`,
      "Release Backlog": 5500,
      "Sprint Backlog / Design": 4000,
      Designing: 3600,
      Prototyping: 3500,
      "Ready for Dev": 10000,
      Developing: 3600,
      "User Acceptance Testing": 3700,
      Shipped: 4000
    }
  ];

  return (
    <div className='mt-[26px] w-full h-full'>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend height={30} verticalAlign="top" align="right" iconType="rect" />
          <Area type="monotone" dataKey="Release Backlog" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="Sprint Backlog / Design" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="Designing" stackId="1" stroke="#ffc658" fill="#ffc658" />
          <Area type="monotone" dataKey="Prototyping" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="Ready for Dev" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="Developing" stackId="1" stroke="#ffc658" fill="#ffc658" />
          <Area type="monotone" dataKey="User Acceptance Testing" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="Shipped" stackId="1" stroke="#ffc658" fill="#ffc658" />
        </AreaChart>
      </ResponsiveContainer>

    </div>
  )
}

export default Flow