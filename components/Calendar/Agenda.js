import React from 'react';
import { Card, Avatar, List } from 'antd';
import events from '../../fakeData/events.json';
import { formatDate } from '../../utils';

const Agenda = () => {
  console.log(events)
  return (
    <div className="w-full">
      {events["Insight Meeting"]?.map((event) => (
        <Card
          key={event.title}
          className="mb-4"
          title={
            <span className="font-semibold text-16">
              {formatDate(event.date)}
            </span>
          }
          style={{ width: "100%" }}
        >
          <List
            itemLayout="horizontal"
            dataSource={event.events}
            renderItem={(event) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                  title={<h3 className="font-semibold">{event.title}</h3>}
                  description={
                    <p className="text-[#8c8c8c]">{event.description}</p>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}
    </div>
  );
}

export default Agenda;
