import React from 'react';
import { Card, Avatar, Divider } from 'antd';
import events from '../../fakeData/events.json';

const Agenda = () => {
  console.log(events)
  return (
    <div className="w-full">
      {events["Insight Meeting"]?.map((event) => (
        <Card
          key={event.title}
          className="mb-4"
          title="Default size card"
          style={{ width: "100%" }}
        >
          <div className="flex items-center">
            <Avatar className="mr-4" src="https://joeschmoe.io/api/v1/random" />
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-[#8c8c8c]">{event.description}</p>
            </div>
          </div>
          <Divider />
        </Card>
      ))}
    </div>
  );
}

export default Agenda;
