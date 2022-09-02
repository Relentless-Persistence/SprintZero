import React, { useState } from "react";
import styled from "styled-components";
import { Card, Checkbox, Input, Avatar } from "antd";
import AppCheckbox from "../AppCheckbox";

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
  huddle,
  handleCheck,
  onClickAddNew,
  doneAddNew, 
  index,
  blockers
}) => {
  console.log(huddle);
  const [showAddNews, setShowAddNews] = useState({
    blockers: false,
    today: false,
    yesterday: false,
  });

  const [addText, setAddText] = useState({
    blockers: "",
    today: "",
    yesterday: "",
  });

  // const clickAddNew = (sectionKey, cardIndex) => {
  //   setShowAddNews({
  //     ...showAddNews,
  //     [sectionKey]: true,
  //   });

  //   onClickAddNew(sectionKey, cardIndex);
  // };

  // const onChange = (e, field) => {
  //   setAddText({
  //     ...addText,
  //     [field]: e.target.value,
  //   });
  // };

  // const reset = (sectionKey) => {
  //   setShowAddNews({
  //     ...showAddNews,
  //     [sectionKey]: false,
  //   });

  //   setAddText({
  //     ...addText,
  //     [sectionKey]: "",
  //   });
  // };

  // const onDone = (e, sectionKey, cardIndex) => {
  //   const val = addText[sectionKey];

  //   if (e.key === "Enter") {
  //     console.log(88);
  //     doneAddNew(sectionKey, cardIndex, val, () => reset(sectionKey));
  //   }
  // };

  return (
    <MyCard
      style={{ display: "flex", flexDirection: "column" }}
      title={
        <Card.Meta
          avatar={
            <Avatar
              size={48}
              src={huddle.user.avatar}
              style={{
                border: "2px solid #315613",
              }}
            />
          }
          title={huddle.user.name}
          description={huddle.role || "Developer"}
        />
      }
    >
      <section>
        <div className="section">
          <h4>Blockers</h4>

          {huddle.data?.blockers?.length ? (
            <ul>
              {huddle.data?.blockers.map((d, i) =>
                !(
                  i == huddle.data?.blockers.length - 1 && showAddNews.blockers
                ) ? (
                  <li key={i}>
                    <Checkbox
                      onChange={() => handleCheck(i, "blockers", index)}
                      checked={d.completed}
                    >
                      {d.completed ? <strike>{d.text}</strike> : d.text}
                    </Checkbox>
                  </li>
                ) : null
              )}

              <li>
                {showAddNews.blockers ? (
                  <Input
                    value={addText.blockers}
                    onKeyPress={(e) => onDone(e, "blockers", index)}
                    onChange={(e) => onChange(e, "blockers")}
                  />
                ) : (
                  <AppCheckbox
                    checked={false}
                    onChange={() => clickAddNew("blockers", index)}
                  >
                    <span className="text-[#BFBFBF]">Add New</span>
                  </AppCheckbox>
                )}
              </li>
            </ul>
          ) : (
            <p className="text-[#595959]">None</p>
          )}
        </div>

        <div className="section">
          <h4>Today</h4>

          {huddle.data?.today?.length ? (
            <ul>
              {huddle.data?.today?.map((d, i) =>
                !(i == huddle.data?.today.length - 1 && showAddNews.today) ? (
                  <li key={i}>
                    <Checkbox
                      onChange={() => handleCheck(i, "today", index)}
                      checked={d.completed}
                    >
                      {d.completed ? <strike>{d.text}</strike> : d.text}
                    </Checkbox>
                  </li>
                ) : null
              )}

              <li>
                {showAddNews.today ? (
                  <Input
                    value={addText.today}
                    onKeyPress={(e) => onDone(e, "today", index)}
                    onChange={(e) => onChange(e, "today")}
                  />
                ) : (
                  <AppCheckbox
                    checked={false}
                    onChange={() => clickAddNew("today", index)}
                  >
                    <span className="text-[#BFBFBF]">Add New</span>
                  </AppCheckbox>
                )}
              </li>
            </ul>
          ) : (
            <p className="text-[#595959]">None</p>
          )}
        </div>

        <div className="section">
          <h4>Yesterday</h4>

          {huddle.data?.yesterday?.length ? (
            <ul>
              {huddle.data?.yesterday?.map((d, i) =>
                !(
                  i == huddle.data?.yesterday.length - 1 &&
                  showAddNews.yesterday
                ) ? (
                  <li key={i}>
                    <Checkbox
                      onChange={() => handleCheck(i, "yesterday", index)}
                      checked={d.completed}
                    >
                      {d.completed ? <strike>{d.text}</strike> : d.text}
                    </Checkbox>
                  </li>
                ) : null
              )}

              <li>
                {showAddNews.yesterday ? (
                  <Input
                    value={addText.yesterday}
                    onKeyPress={(e) => onDone(e, "yesterday", index)}
                    onChange={(e) => onChange(e, "yesterday")}
                  />
                ) : (
                  <AppCheckbox
                    checked={false}
                    onChange={() => clickAddNew("yesterday", index)}
                  >
                    <span className="text-[#BFBFBF]">Add New</span>
                  </AppCheckbox>
                )}
              </li>
            </ul>
          ) : (
            <p className="text-[#595959]">None</p>
          )}
        </div>
      </section>
    </MyCard>
  );
};

export default HuddleCard;
