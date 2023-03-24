import {
  Bar,
  ComposedChart,
  Label,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { FC } from "react"

const Burndown: FC = () => {

  const data = [
    {
      name: `Page A`,
      uv: 590,
      pv: 800,
      amt: 1400,
    },
    {
      name: `Page B`,
      uv: 868,
      pv: 967,
      amt: 1506,
    },
    {
      name: `Page C`,
      uv: 1397,
      pv: 1098,
      amt: 989,
    },
    {
      name: `Page D`,
      uv: 1480,
      pv: 1200,
      amt: 1228,
    },
    {
      name: `Page E`,
      uv: 1520,
      pv: 1108,
      amt: 1100
    },
    {
      name: `Page F`,
      uv: 1400,
      pv: 680,
      amt: 1700,
    },
  ];

  return (
    <div className='mt-[26px] w-full h-full'>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          // width={1000}
          // height={400}
          data={data}

        >
          {/* <CartesianGrid stroke="#f5f5f5" /> */}
          <XAxis dataKey="name" />
          <YAxis>
            <Label value="Points" offset={1} angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip />
          <Legend height={30} fontSize="12px" iconSize={12} verticalAlign="top" align="right" payload={[{ value: `Planned`, type: `square`, id: `uv`, color: `#5B8FF9` }, { value: `Added`, type: `line`, id: `pv`, color: `#8C8C8C` }]} />
          <Bar dataKey="uv" barSize={108.09} fill="#5B8FF9" />
          <Line type="monotone" dataKey="pv" stroke="#61D7A7" strokeWidth={2} label={{ fill: `rgba(0, 0, 0, 0.65)`, fontSize: 12, position: `top` }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Burndown