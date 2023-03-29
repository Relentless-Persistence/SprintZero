import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { FC } from "react"


type Entry = {
  value: number,
  color: string,
  name: string
}

type TooltipPayload = {
  payload: Entry[];
  label: string;
}

const data = [
  {
    month: `Feb 3`,
    a: 4000,
    b: 2400,
    c: 2400,
    d: 3000,
    e: 2800,
  },
  {
    month: `Feb 13`,
    a: 3000,
    b: 1398,
    c: 2210,
    d: 3200,
    e: 1800,
  },
  {
    month: `Feb 23`,
    a: 2000,
    b: 9800,
    c: 2290,
    d: 2300,
    e: 4800,
  },
  {
    month: `Mar 5`,
    a: 2780,
    b: 3908,
    c: 2000,
    d: 3000,
    e: 2800,
  },
  {
    month: `Mar 15`,
    a: 1890,
    b: 4800,
    c: 2181,
    d: 3000,
    e: 2800,
  },
  {
    month: `Mar 25`,
    a: 2390,
    b: 3800,
    c: 2500,
    d: 3000,
    e: 2800,
  },
  {
    month: `Apr 4`,
    a: 3490,
    b: 4300,
    c: 2100,
    d: 3000,
    e: 2800,
  },
];

const toPercent = (decimal: number, fixed = 0): string => `${(decimal * 100).toFixed(fixed)}%`;

const percent = (decimal: number): string => `${(decimal * 100)}%`;

const getPercent = (value: number, total: number): string => {
  const ratio = total > 0 ? value / total : 0;

  return toPercent(ratio, 2);
};

const renderTooltipContent = (o: TooltipPayload): JSX.Element => {
  const { payload, label } = o;

  const total: number = payload.reduce((result: number, entry: Entry) => result + entry.value, 0);

  return (
    <div className="customized-tooltip-content">
      <p className="total">{`${label} (Total: ${total})`}</p>
      <ul className="list">
        {payload.map((entry: Entry, index: number) => (
          <li key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}(${getPercent(entry.value, total)})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Velocity: FC = () => {

  return (
    <div className='mt-[26px] w-full h-full'>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={data}
          stackOffset="expand"

        >
          <CartesianGrid strokeDasharray="3 3" />
          <Legend height={30} fontSize="12px" iconSize={12} verticalAlign="top" align="right" iconType='rect' />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={percent} />
          <Tooltip content={renderTooltipContent} />
          <Area type="monotone" dataKey="a" stackId="1" stroke="#E8684A" fill="#8884d8" />
          <Area type="monotone" dataKey="b" stackId="1" stroke="#F6BD16" fill="#82ca9d" />
          <Area type="monotone" dataKey="c" stackId="1" stroke="#5D7092" fill="#ffc658" />
          <Area type="monotone" dataKey="d" stackId="1" stroke="#5AD8A6" fill="#82ca9d" />
          <Area type="monotone" dataKey="e" stackId="1" stroke="#5B8FF9" fill="#ffc658" />
        </AreaChart>
      </ResponsiveContainer>

    </div>
  )
}

export default Velocity