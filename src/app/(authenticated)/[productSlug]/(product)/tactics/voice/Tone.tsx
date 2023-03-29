import { Form, Input, Table } from 'antd';
import { doc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from 'react';

import type { InputRef } from 'antd';
import type { FormInstance } from 'antd/es/form';

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { db } from "~/utils/firebase"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key?: string;
  col1: string;
  col2: string;
  col3: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values } as Item);
    } catch (errInfo) {
      console.log(`Save failed:`, errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={() => {
          save().catch(console.error)
        }} onBlur={toggleEdit} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key?: string;
  col1: string;
  col2: string;
  col3: string;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const ToneTab: React.FC = () => {
  const { product } = useAppContext()

  const toneData = product.data().tone

  const dataSource: DataType[] = toneData.rows

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [{
    dataIndex: `key`,
    rowScope: `row`,
  }, ...toneData.columns]

  const handleSave = async (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });

    await updateDoc(doc(db, `Products`, product.id), {
      tone: {
        columns: toneData.columns,
        rows: newData
      }
    })
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <div>
      <Table
        components={components}
        rowClassName={() => `editable-row`}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
        pagination={false}
        showHeader={false}
      />
    </div>
  );
};

export default ToneTab;