import React from "react";
import { Button, Card, Space, Table, Typography } from "antd";
import { Note } from "../notes/types";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Flashcard {
  id: string;
  subjectId: string;
  topicId: string;
  noteId: string;
  question: string;
  answer: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FlashCardListProps {
  flashcards: Flashcard[];
  onEdit: (flashcard: Flashcard) => void;
  onDelete: (flashcard: Flashcard) => void;
  loading?: boolean;
  onView: (flashcard: Flashcard) => void;
}

const FlashCardList: React.FC<FlashCardListProps> = ({
  flashcards,
  onEdit,
  onDelete,
  loading,
}) => {
  const columns = [
    {
      title: "Note Title",
      dataIndex: "title",
      key: "title",
      width: "24%",
      render: (text: string, record: Flashcard) => (
        <Text
          ellipsis
          style={{ cursor: "pointer", color: "#1890ff", maxWidth: "230px" }}
        >
          {/* {text} */}
          An object at rest stays at rest, and an object in motion stays in
          motion unless acted upon by an external force.
        </Text>
      ),
    },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      width: "24%",
      render: (text: string, record: Flashcard) => (
        <Text
          ellipsis
          style={{ cursor: "pointer", color: "#1890ff", maxWidth: "230px" }}
        >
          {/* {text} */}
          An object at rest stays at rest, and an object in motion stays in
          motion unless acted upon by an external force.
        </Text>
      ),
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      width: "24%",
      render: (text: string, record: Flashcard) => (
        <Text
          ellipsis
          style={{ cursor: "pointer", color: "#1890ff", maxWidth: "230px" }}
        >
          {/* {text} */}
          An object at rest stays at rest, and an object in motion stays in
          motion unless acted upon by an external force.
        </Text>
      ),
    },

    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: "14%",
      render: (text: string, record: Flashcard) => (
        <Text
          ellipsis
          style={{ cursor: "pointer", color: "#1890ff", maxWidth: "230px" }}
        >
          {/* {text} */}
          Physics
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "14%",
      render: (_: any, record: Flashcard) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            title="Edit"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <Table
        columns={columns}
        dataSource={flashcards}
        rowKey="id"
        loading={loading}
        className="notes-table hide-scrollbar"
        rowClassName={() => "notes-table-row"}
        // style={{
        //   width: "100%",
        // }}
        // scroll={{
        //   y: "52vh",
        //   x: "max-content",
        // }}
      />
    </div>
  );
};

export default FlashCardList;
