import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { FC } from "react"
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems"

import { getStories } from "~/utils/storyMap"

interface MonthlyData {
  name: string,
  releaseBacklog: number,
  sprintBacklogDesign: number,
  designing: number,
  prototyping: number,
  readyForDev: number,
  developing: number,
  userAcceptanceTesting: number,
  shipped: number
}

export type SprintColumnProps = {
  storyMapItems: StoryMapItem[]
}

const Flow: FC<SprintColumnProps> = ({ storyMapItems }) => {
  const story = getStories(storyMapItems)

  const data = [
    {
      "name": `March 2023`,
      "releaseBacklog": 2,
      "sprintBacklogDesign": 0,
      "designing": 1,
      "prototyping": 0,
      "readyForDev": 0,
      "developing": 1,
      "userAcceptanceTesting": 0,
      "shipped": 0
    },
    {
      "name": `April 2023`,
      "releaseBacklog": 2,
      "sprintBacklogDesign": 0,
      "designing": 1,
      "prototyping": 0,
      "readyForDev": 3,
      "developing": 0,
      "userAcceptanceTesting": 0,
      "shipped": 0
    },
    {
      "name": `May 2023`,
      "releaseBacklog": 2,
      "sprintBacklogDesign": 0,
      "designing": 1,
      "prototyping": 0,
      "readyForDev": 4,
      "developing": 0,
      "userAcceptanceTesting": 0,
      "shipped": 6
    }
  ]


  // Group the data by month

  const groupedData = story.reduce((result, item) => {
    const updatedAt = new Date(item.updatedAt.seconds * 1000);
    const monthName = new Intl.DateTimeFormat(`en-US`, { month: `long` }).format(updatedAt);
    const year = updatedAt.getFullYear();
    const key = `${monthName} ${year}`;

    if (!result[key]) {
      result[key] = {};
    }

    // Count the number of items in each sprintColumn
    const sprintColumn = item.sprintColumn || `No sprintColumn`;
    if (!result[key][sprintColumn]) {
      result[key][sprintColumn] = 0;
    }
    result[key][sprintColumn]++;

    return result;
  }, {});

  // Convert the grouped data to the desired format
  const monthlyData = Object.keys(groupedData).map((key) => {
    const columns = groupedData[key];
    const result: MonthlyData = {
      name: key,
      releaseBacklog: columns.releaseBacklog ?? 0,
      sprintBacklogDesign: columns.sprintBacklogDesign ?? 0,
      designing: columns.designing ?? 0,
      prototyping: columns.prototyping ?? 0,
      readyForDev: columns.readyForDev ?? 0,
      developing: columns.developing ?? 0,
      userAcceptanceTesting: columns.userAcceptanceTesting ?? 0,
      shipped: columns.shipped ?? 0,
    };
    return result;
  });

  return (
    <div className='mt-[26px] w-full h-full'>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={monthlyData}
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
          <Area type="monotone" dataKey="releaseBacklog" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="sprintBacklog" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="designing" stackId="1" stroke="#ffc658" fill="#ffc658" />
          <Area type="monotone" dataKey="prototyping" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="readyForDev" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="developing" stackId="1" stroke="#ffc658" fill="#ffc658" />
          <Area type="monotone" dataKey="userAcceptanceTesting" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="shipped" stackId="1" stroke="#ffc658" fill="#ffc658" />
        </AreaChart>
      </ResponsiveContainer>

    </div>
  )
}

export default Flow