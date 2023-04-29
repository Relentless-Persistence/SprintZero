import type { FC } from "react";
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems";

import StoryTaskColumn from "./StoryTaskColumn";

interface AcceptanceCriteria {
  id: string;
  name: string;
  checked: boolean;
  status: string;
}

interface Bug {
  id: string;
  name: string;
  checked: boolean;
  status: string;
}

type Props = {
  storyMapItems: StoryMapItem[];
  tab: string;
};

const StoryTask: FC<Props> = ({ storyMapItems, tab }) => {

  const acceptanceCriterias: AcceptanceCriteria[] = storyMapItems.reduce(
    (acc: AcceptanceCriteria[], item) => {
      if (item.acceptanceCriteria.length) {
        acc.push(...item.acceptanceCriteria);
      }
      return acc;
    },
    []
  );

  const bugs: Bug[] = storyMapItems.reduce((acc: Bug[], item) => {
    if (item.bugs.length) {
      acc.push(...item.bugs);
    }
    return acc;
  }, []);

  return (
    <div className="">
      {acceptanceCriterias.length > 0 && bugs.length > 0 && (
        <div className="h-full grid grow auto-cols-[360px] grid-flow-col gap-4">
          <StoryTaskColumn
            id="todo"
            title="To Do"
            tasks={tab === `bugs` ? bugs : acceptanceCriterias}
            storyMapItems={storyMapItems}
            tab={tab}
          />
          <StoryTaskColumn
            id="inProgress"
            title="In Progress"
            tasks={tab === `bugs` ? bugs : acceptanceCriterias}
            storyMapItems={storyMapItems}
            tab={tab}
          />
          <StoryTaskColumn
            id="review"
            title="Review"
            tasks={tab === `bugs` ? bugs : acceptanceCriterias}
            storyMapItems={storyMapItems}
            tab={tab}
          />
          <StoryTaskColumn
            id="done"
            title="Done"
            tasks={tab === `bugs` ? bugs : acceptanceCriterias}
            storyMapItems={storyMapItems}
            tab={tab}
          />
        </div>
      )}
    </div>
  );
};

export default StoryTask;
