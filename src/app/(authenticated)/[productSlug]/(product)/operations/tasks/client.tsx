"use client"

import { Breadcrumb, Button, Tabs, Tag } from "antd"
import { collection, query } from "firebase/firestore"
import { useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"
import type { Task } from "~/types/db/Products/Tasks"

import GeneralTasks from "./GeneralTask"
import TaskDrawer from "./TaskDrawer"
import { useStoryMapContext } from "../../map/StoryMapContext"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { StoryMapItemConverter } from "~/types/db/Products/StoryMapItems"
import { TaskConverter } from "~/types/db/Products/Tasks"

interface MyTask extends Task {
  id: string
}

const TasksClientPage: FC = () => {
  const { product } = useAppContext()
  const [currentTab, setCurrentTab] = useState(`acceptance criteria`)
  const [newTask, setNewTask] = useState(false)

  const [tasks, , tasksError] = useCollection(
    query(collection(product.ref, `Tasks`)).withConverter(TaskConverter),
  )
  useErrorHandler(tasksError)

  const [storyMapItemsSnap, , storyMapItemsSnapError] = useCollection(
    collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter),
  )
  useErrorHandler(storyMapItemsSnapError)

  if (!storyMapItemsSnap) return null

  const storyMapsItems = storyMapItemsSnap.docs.map((item) => item.data())

  const totalAcceptanceCriteria = storyMapsItems.reduce((sum, item) => {
    return sum + item.acceptanceCriteria.length;
  }, 0);

  const totalBugs = storyMapsItems.reduce((sum, item) => {
    return sum + item.bugs.length;
  }, 0);

  const acTasks: MyTask[] = tasks
    ? tasks.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((task) => task.type === `acceptanceCriteria`)
    : [];

  const bugTasks: MyTask[] = tasks
    ? tasks.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((task) => task.type === `bug`)
    : [];

  const dSTasks: MyTask[] = tasks
    ? tasks.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((task) => task.type === `dataScience`)
    : [];

  const pipeTasks: MyTask[] = tasks
    ? tasks.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((task) => task.type === `pipelines`)
    : [];

  const randomTasks: MyTask[] = tasks
    ? tasks.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((task) => task.type === `random`)
    : [];

  return (
    <div className="flex h-full flex-col px-12 pb-0 py-8">
      <div className="mb-5">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Tactics` }, { title: `Tasks` }, { title: currentTab }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">Get.Stuff.Done.</h1>
        <p className="text-textTertiary">Track specific activity that needs to be completed to achieve a certain goal or objective.</p>
      </div>

      <div className="flex h-full flex-col gap-4">
        <Tabs
          className="min-h-0 grow [&_.ant-tabs-content]:h-full [&_.ant-tabs-nav]:px-0 [&_.ant-tabs-tabpane]:h-full"
          activeKey={currentTab}
          onChange={(key) => setCurrentTab(key)}
          tabBarExtraContent={currentTab !== `acceptance criteria` && currentTab !== `bugs` ? <Button onClick={() => setNewTask(true)}>Add Task</Button> : null}
          items={[
            {
              label: <div className="space-x-2"><Tag>{totalAcceptanceCriteria}</Tag><span>Acceptance Criteria</span></div>,
              key: `acceptance criteria`,
              children: (

                <GeneralTasks tasks={acTasks} storyMapItems={storyMapsItems} />
              ),
            },
            {
              label: <div className="space-x-2"><Tag>{totalBugs}</Tag><span>Bugs</span></div>,
              key: `bugs`,
              children: (

                <GeneralTasks tasks={bugTasks} storyMapItems={storyMapsItems} />

              ),
            },
            {
              label: <div className="space-x-2"><Tag>{dSTasks.length}</Tag><span>Data Science</span></div>,
              key: `dataScience`,
              children: (

                <GeneralTasks tasks={dSTasks} />

              ),
            },
            {
              label: <div className="space-x-2"><Tag>{pipeTasks.length}</Tag><span>Pipelines</span></div>,
              key: `pipelines`,
              children: (
                <GeneralTasks tasks={pipeTasks} />
              ),
            },
            {
              label: <div className="space-x-2"><Tag>{randomTasks.length}</Tag><span>Random</span></div>,
              key: `random`,
              children: (
                <GeneralTasks tasks={randomTasks} />
              ),
            },
          ]}
        />
      </div>

      {newTask && (
        <TaskDrawer
          isOpen={newTask}
          setNewTask={setNewTask}
          type={currentTab}
        />
      )}
    </div>
  )
}

export default TasksClientPage
