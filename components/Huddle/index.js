import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Card, Checkbox, Input, Avatar, message } from "antd";
import AppCheckbox from "../AppCheckbox";
import { db, serverTimestamp } from "../../config/firebase-config";
import {isToday, isYesterday} from 'date-fns'

const MyCard = styled(Card)`
  border: 1px solid #d9d9d9;
  .ant-card-meta-title {
    margin-bottom: 0 !important;
  }

  .ant-card-body {
    flex-grow: 1;
    max-height: 65vh;
    overflow-y: auto;
    padding: 12px 16px;
  }

  .section {
    margin-bottom: 20px;
    h4 {
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 5px;
    }

    .ant-checkbox-checked .ant-checkbox-inner {
      background: #4a801d;
      border: 1px solid #4a801d;
      border-radius: 2px;
    }
  }
`;

const HuddleCard = ({
  todayInTime,
  yesterdayInTime,
  today,
  yesterday,
  member,
  product,
  blockers
}) => {
  const [showAddNewBlocker, setShowAddNewBlocker] = useState(false);
  const [newBlocker, setNewBlocker] = useState("");
  const [showAddNewToday, setShowAddNewToday] = useState(false);
  const [newToday, setNewToday] = useState("");
  const [showAddNewYesterday, setShowAddNewYesterday] = useState(false);
  const [newYesterday, setNewYesterday] = useState("");
  
  console.log("todayInTime", todayInTime);

  const onBlockerDone = (e) => {
    if (newBlocker !== "") {
      if (e.key === "Enter") {
        db.collection("HuddleBlockers")
          .add({
            user: member.user,
            completed: false,
            title: newBlocker,
            createdAt: new Date(),
            product_id: product.id,
          })
          .then((docRef) => {
            message.success("New blocker added successfully");
          })
          .catch((error) => {
            message.error("Error adding blocker item");
          });
        setShowAddNewBlocker(false);
        setNewBlocker("");
      }
    }
  };

  const updateBlocker = async (id, checked) => {
    await db
      .collection("HuddleBlockers")
      .doc(id)
      .update({
        completed: checked,
      })
      .then(() => {
        message.success("Blocker updated successfully");
      });
  };

  // Today
  const onTodayDone = (e) => {
    if (newToday !== "") {
      if (e.key === "Enter") {
        db.collection("Huddles")
          .add({
            user: member.user,
            completed: false,
            title: newToday,
            createdAt: new Date(),
            product_id: product.id,
          })
          .then((docRef) => {
            message.success("New huddle added successfully");
          })
          .catch((error) => {
            message.error("Error adding huddle item");
          });
        setShowAddNewToday(false);
        setNewToday("");
      }
    }
  };

  const updateToday = async (id, checked) => {
    await db
      .collection("Huddles")
      .doc(id)
      .update({
        completed: checked,
      })
      .then(() => {
        message.success("Huddle updated successfully");
      });
  };

  // Yesterday
  const onYesterdayDone = (e) => {
    if (newYesterday !== "") {
      if (e.key === "Enter") {
        db.collection("Huddles")
          .add({
            user: member.user,
            completed: false,
            title: newYesterday,
            createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
            product_id: product.id,
          })
          .then((docRef) => {
            message.success("New huddle added successfully");
          })
          .catch((error) => {
            message.error("Error adding huddle item");
          });
        setShowAddNewYesterday(false);
        setNewYesterday("");
      }
    }
  };

  const updateYesterday = async (id, checked) => {
    await db
      .collection("Huddles")
      .doc(id)
      .update({
        completed: checked,
      })
      .then(() => {
        message.success("Yesterday huddle updated successfully");
      });
  };

  return (
    <MyCard
      style={{ display: "flex", flexDirection: "column" }}
      title={
        <Card.Meta
          avatar={
            <Avatar
              size={48}
              src={member.user.avatar || "https://joeschmoe.io/api/v1/random"}
              style={{
                border: "2px solid #315613",
              }}
            />
          }
          title={member?.user?.name}
          // description={member.role || "Developer"}
        />
      }
    >
      <section>
        <div className="section">
          <h4>Blockers</h4>

          {blockers?.length ? (
            <ul>
              {blockers.map((d, i) => (
                <li key={i}>
                  <Checkbox
                  disabled={(todayInTime != (new Date()).setHours(0,0,0,0))}
                    onChange={() => updateBlocker(d.id, !d.completed)}
                    checked={d.completed}
                  >
                    {d.completed ? <strike>{d.title}</strike> : d.title}
                  </Checkbox>
                </li>
              ))}

{(todayInTime === (new Date()).setHours(0,0,0,0)) &&
              <li>
                {showAddNewBlocker ? (
                  <Input
                    value={newBlocker}
                    onKeyPress={(e) => onBlockerDone(e)}
                    onChange={(e) => setNewBlocker(e.target.value)}
                    size="small"
                  />
                ) : (
                  <AppCheckbox
                    checked={false}
                    onChange={() => setShowAddNewBlocker(true)}
                  >
                    <span className="text-[#BFBFBF]">Add New</span>
                  </AppCheckbox>
                )}
              </li>
}
            </ul>
          ) : (
            <ul>
              {(todayInTime == (new Date()).setHours(0,0,0,0)) &&
              <li>
                {showAddNewBlocker ? (
                  <Input
                    value={newBlocker}
                    onKeyPress={(e) => onBlockerDone(e)}
                    onChange={(e) => setNewBlocker(e.target.value)}
                    size="small"
                  />
                ) : (
                  <AppCheckbox
                    checked={false}
                    onChange={() => setShowAddNewBlocker(true)}
                  >
                    <span className="text-[#BFBFBF]">Add New Blocker</span>
                  </AppCheckbox>
                )}
              </li>
}
            </ul>
          )}
        </div>

        <div className="section">
          <h4>Today</h4>

          {today?.length ? (
            <ul>
              {today?.map((d, i) => (
                <li key={i}>
                  <Checkbox 
                    disabled={(todayInTime != (new Date()).setHours(0,0,0,0))}
                    onChange={() => updateToday(d.id, !d.completed)}
                    checked={d.completed}
                  >
                    {d.completed ? <strike>{d.title}</strike> : d.title}
                  </Checkbox>
                </li>
              ))}
              
              {(todayInTime == (new Date()).setHours(0,0,0,0)) &&
              
              <li>
                {showAddNewToday ? (
                  <Input
                    value={newToday}
                    onKeyPress={(e) => onTodayDone(e)}
                    onChange={(e) => setNewToday(e.target.value)}
                  />
                ) : (
                  <AppCheckbox
                    checked={false}
                    onChange={() => setShowAddNewToday(true)}
                  >
                    <span className="text-[#BFBFBF]">Add New</span>
                  </AppCheckbox>
                )}
              </li>
            }
            </ul>
          ) : (
            <ul>
              {(todayInTime == (new Date()).setHours(0,0,0,0)) &&
              <li>
                {showAddNewToday ? (
                  <Input
                    value={newToday}
                    onKeyPress={(e) => onTodayDone(e)}
                    onChange={(e) => setNewToday(e.target.value)}
                  />
                ) : (
                  <AppCheckbox
                    checked={false}
                    onChange={() => setShowAddNewToday(true)}
                  >
                    <span className="text-[#BFBFBF]">Add New</span>
                  </AppCheckbox>
                )}
              </li>
}
            </ul>
          )}
        </div>

        <div className="section">
          <h4>Yesterday</h4>

          {yesterday?.length ? (
            <ul>
              {yesterday?.map((d, i) => (
                <li key={i}>
                  <Checkbox
                  disabled={(todayInTime != (new Date()).setHours(0,0,0,0))}
                    onChange={() => updateYesterday(d.uid, !d.completed)}
                    checked={d.completed}
                  >
                    {d.completed ? <strike>{d.title}</strike> : d.title}
                  </Checkbox>
                </li>
              ))}

{(todayInTime == (new Date()).setHours(0,0,0,0)) &&
              <li>
                {showAddNewYesterday ? (
                  <Input
                    value={newYesterday}
                    onKeyPress={(e) => onYesterdayDone(e)}
                    onChange={(e) => setNewYesterday(e.target.value)}
                  />
                ) : (
                  <AppCheckbox
                    checked={false}
                    on
                    onChange={() => setShowAddNewYesterday(true)}
                  >
                    <span className="text-[#BFBFBF]">Add New</span>
                  </AppCheckbox>
                )}
              </li>
}
            </ul>
          ) : (
            <ul>
              {(todayInTime == (new Date()).setHours(0,0,0,0)) &&
              <li>
                {showAddNewYesterday ? (
                  <Input
                    value={newYesterday}
                    onKeyPress={(e) => onYesterdayDone(e)}
                    onChange={(e) => setNewYesterday(e.target.value)}
                  />
                ) : (
                  <AppCheckbox
                    checked={false}
                    on
                    onChange={() => setShowAddNewYesterday(true)}
                  >
                    <span className="text-[#BFBFBF]">Add New</span>
                  </AppCheckbox>
                )}
              </li>
}
            </ul>
          )}
        </div>
      </section>
    </MyCard>
  );
};

export default HuddleCard;
