"use client"

import { Breadcrumb, Button, Tabs } from "antd"
import dayjs from "dayjs"
import { Timestamp, addDoc, collection, doc, query, updateDoc, where } from "firebase/firestore"
import { useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { ComponentProps, FC } from "react"
import type { Task } from "~/types/db/Products/Tasks"

import GeneralTasks from "./GeneralTask"
import TaskDrawer from "./TaskDrawer"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { TaskConverter } from "~/types/db/Products/Tasks"

interface MyTask extends Task {
  id: string
}

const TasksClientPage: FC = () => {
  const { product } = useAppContext()
  const [currentTab, setCurrentTab] = useState(`acceptance criteria`)
  const [newTask, setNewTask] = useState(false)

  const [tasks, tasksLoading, tasksError] = useCollection(
    query(collection(product.ref, `Tasks`), where(`type`, `==`, currentTab)).withConverter(TaskConverter),
  )
  useErrorHandler(tasksError)



  return (
    <div className="flex flex-col px-12 py-8">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Tactics` }, { title: `Tasks` }, { title: currentTab }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">Get.Stuff.Done.</h1>
        <p className="text-textTertiary">Track specific activity that needs to be completed to achieve a certain goal or objective.</p>
      </div>

      <div className="flex-grow mt-6">
        <Tabs
          activeKey={currentTab}
          onChange={(key) => setCurrentTab(key)}
          tabBarExtraContent={currentTab !== `acceptance criteria` && currentTab !== `bugs` ? <Button onClick={() => setNewTask(true)}>Add Task</Button> : null}
          items={[
            {
              label: `Acceptance Criteria`,
              key: `acceptance criteria`,
              children: (
                <div className="w-full">
                  Acceptance Criteria
                </div>
              ),
            },
            {
              label: `Bugs`,
              key: `bugs`,
              children: (
                <div className="w-full">
                  Bugs
                </div>
              ),
            },
            {
              label: `Data Science`,
              key: `data science`,
              children: (
                <div className="w-full">
                  <GeneralTasks tasks={tasks?.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(task => task.type === `data science`)} />
                </div>
              ),
            },
            {
              label: `Pipelines`,
              key: `pipelines`,
              children: (
                <div className="w-full">
                  <GeneralTasks tasks={tasks?.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(task => task.type === `pipelines`)} />
                </div>
              ),
            },
            {
              label: `Random`,
              key: `random`,
              children: (
                <div className="w-full">
                  <GeneralTasks tasks={tasks?.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(task => task.type === `random`)} />
                </div>
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
