import React from "react";
import { Table, Space, Button, Tag, Typography } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Note } from "./types";
import "./notes.css";

const { Text } = Typography;

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onView: (note: Note) => void;
  loading?: boolean;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  onEdit,
  onDelete,
  onView,
  loading,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange = () => {},
}) => {
  const columns = [
    {
      title: "Note Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Note) => (
        <Text ellipsis style={{ maxWidth: 200 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "PDF File",
      dataIndex: "file",
      key: "file",
      render: (text: string, record: Note) => (
        <Text
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => onView(record)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "FlashCards",
      key: "flashcards",
      render: () => "No FlashCards",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Note) => (
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
        dataSource={notes}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          onChange: onPageChange,
          onShowSizeChange: (current, size) => onPageChange?.(current, size),
        }}
        className="notes-table hide-scrollbar"
        rowClassName={() => "notes-table-row"}
        style={{
          width: "100%",
        }}
        scroll={{
          y: "52vh",
          x: "max-content",
        }}
      />
    </div>
  );
};

export default NotesList;
