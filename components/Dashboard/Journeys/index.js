import React, { useRef, useState, useEffect } from "react";
import { Divider } from "antd";
import { Dot, Ellipse } from "./ellipse";

import { intervalToDuration } from "../../../utils/dateTimeHelpers";

const map = {
  year: "years",
  month: "months",
  week: "weeks",
  day: "days",
  hour: "hours",
  minute: "minutes",
  second: "seconds",
};

const Chart = ({ journey, events }) => {
  const wrapper = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const jStart = journey?.start;
  // const events = journey?.events;

  useEffect(() => {
    if (wrapper?.current) {
      setChartWidth(wrapper.current.getBoundingClientRect().width);
    }
  }, []);

  const getDims = (evtStart, evtEnd, evtLevel) => {
    const interval = intervalToDuration({
      start: new Date(jStart),
      end: new Date(evtStart),
    });

    const eInterval = intervalToDuration({
      start: new Date(evtStart),
      end: new Date(evtEnd),
    });

    const scale = interval[map[journey.durationType]];

    const diff = eInterval[map[journey.durationType]];

    const scaledWidth = (evtLevel / 100) * chartWidth * (2 / 3);

    const width = scaledWidth || 2 / 3;

    const height = (diff / journey.duration) * 100;
    const top = (scale / journey.duration) * 100;

    return {
      top,
      width,
      height,
    };
  };

  return (
    <div
      style={{
        height: "65vh",
        marginLeft: "2%",
      }}
      ref={wrapper}
      className="relative mt-[30px]"
    >
      <Divider className="absolute border-dashed min-w-[100px] w-2/3 top-0 left-0 border-[#A6AE9D] m-0" />

      <Divider
        type="vertical"
        className="absolute min-h-full right-1/3 top-0 border-[#A6AE9D] m-0"
      />

      {events?.map((e) => {
        return (
          <Ellipse
            key={e.id}
            event={e}
            dims={getDims(e.start, e.end, e.level)}
            journey={journey}
          />
        );
      })}

      <Dot
        style={{
          top: 0,
          left: `${200 / 3}%`,
          transform: "translate(-50%,-50%)",
        }}
      />

      <p className="absolute top-0 left-2/3 truncate capitalize text-[12px] leading-[16px] -translate-y-2/4 pl-[14px]">{`${journey?.durationType} 1`}</p>

      <Dot
        style={{
          top: "100%",
          left: `${200 / 3}%`,
          transform: "translate(-50%,-50%)",
        }}
      />

      <p className="absolute bottom-0 left-2/3 truncate capitalize text-[12px] leading-[16px] translate-y-2/4 pl-[14px]">{`${journey?.durationType} ${journey?.duration}`}</p>

      {/* x labels */}

      <div className="absolute w-2/3 flex items-center justify-between py-[4px] pl-[2px] pr-[6px] left-0">
        <p className="text-[#A6AE9D] text-[12px] leading-[16px]">High</p>

        <p className="text-[#A6AE9D] text-[12px] leading-[16px]">Low</p>
      </div>

      {/* y-labels */}

      <div
        style={{ height: "112%", transform: "translateY(-5%)" }}
        className="absolute w-2/3 flex flex-col items-center justify-between right-0"
      >
        <p className="font-[600] text-[#A6AE9D] text-[14px] leading-[22px]">
          Start
        </p>

        <p className="font-[600] text-[#A6AE9D] text-[14px] leading-[22px]">
          Finish
        </p>
      </div>

      {/* legends */}

      <div
        style={{
          left: "-10%",
          top: "50%",
          transform: "rotate(-90deg)",
        }}
        className="absolute flex items-center"
      >
        <div className="flex items-center justify-between mr-[16px] ">
          <p className="font-[400] text-[#8C8C8C] text-[12px] leading-[16px] mr-[2px]">
            Frustrated
          </p>
          <span
            style={{
              width: "24px",
              height: "11px",
              borderRadius: "12px",
              backgroundColor: "#FF4D4F",
            }}
          />
        </div>

        <div className="flex items-center justify-between]">
          <p className="font-[400] text-[#8C8C8C] text-[12px] leading-[16px] mr-[2px]">
            Delighted
          </p>
          <span
            style={{
              width: "24px",
              height: "11px",
              borderRadius: "12px",
              backgroundColor: "#009CD5",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { Chart };
