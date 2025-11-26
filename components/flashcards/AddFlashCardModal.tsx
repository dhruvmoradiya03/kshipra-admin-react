import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, Col, Row } from "antd";
import { Work_Sans } from "next/font/google";
import { getTopics } from "@/service/api/config.api";

const { TextArea } = Input;
const { Option } = Select;

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

interface AddFlashCardModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  subjects: Subject[];
  topics: Topic[];
  loading?: boolean;
}

const AddFlashCardModal: React.FC<AddFlashCardModalProps> = ({
  visible,
  onCancel,
  onSave,
  subjects,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [topic, setTopic] = useState<any>([]);

  const fetchTopics = async () => {
    try {
      const topics = await getTopics(selectedSubject);

      setTopic(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [selectedSubject]);

  useEffect(() => {
    setSelectedSubject(null);
    setTopic([]);
  }, []);

  const handleSubmit = () => {
    // form
    //   .validateFields()
    //   .then((values) => {
    //     form.resetFields();
    //     onSave(values);
    //   })
    //   .catch(() => {});

    onCancel();
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
      className="rounded-lg"
    >
      <h2 className="text-[#1E4640] font-medium text-2xl">Add Flashcard</h2>

      <Form form={form} layout="vertical" className="mt-4 box-border">
        {/* SUBJECT + TOPIC ROW */}
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: "Please select subject" }]}
              className={`font-medium text-[#1E4640] ${worksans.className}`}
            >
              <Select
                placeholder="Select Subject"
                className="h-[45px] rounded-lg font-400"
                options={subjects?.map((item: any) => ({
                  label: item.name,
                  value: item.document_id,
                }))}
                onChange={(value) => setSelectedSubject(value)}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="topic"
              label="Topic"
              rules={[{ required: true, message: "Please select topic" }]}
              className={`font-medium text-[#1E4640] ${worksans.className}`}
            >
              <Select
                placeholder="Select Topic"
                className="h-[45px] rounded-lg font-400"
                options={topic?.map((item: any) => ({
                  label: item.name,
                  value: item.document_id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col className="w-full">
            <Form.Item
              name="noteTitle"
              label="Note Title"
              rules={[{ required: true, message: "Enter note title" }]}
              className={`font-medium text-[#1E4640] ${worksans.className}`}
            >
              <Select
                placeholder="Select Topic"
                className="h-[45px] rounded-lg font-400"
                options={topic?.map((item: any) => ({
                  label: item.name,
                  value: item.document_id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="question"
          label="Question"
          rules={[{ required: true }]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <div className="flex gap-3">
            <Input
              placeholder="Add Question"
              style={{
                height: 45,
                borderRadius: 8,
                fontFamily: "Work Sans",
                fontWeight: 400,
              }}
            />
          </div>
        </Form.Item>

        <Form.Item
          name="answer"
          label="Answer"
          rules={[{ required: true, message: "Add Answer" }]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <div className="flex gap-3">
            <Input
              placeholder="Add Answer"
              style={{
                height: 45,
                borderRadius: 8,
                fontFamily: "Work Sans",
                fontWeight: 400,
              }}
            />
          </div>
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Add Category" }]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <div className="flex gap-3">
            <Input
              placeholder="Add Category"
              style={{
                height: 45,
                borderRadius: 8,
                fontFamily: "Work Sans",
                fontWeight: 400,
              }}
            />
          </div>
        </Form.Item>

        {/* FOOTER BUTTONS */}
        <div className={`flex justify-end gap-4 mt-8 ${worksans.className}`}>
          <Button
            onClick={onCancel}
            style={{
              height: 44,
              width: 120,
              borderRadius: 8,
              border: "1px solid #1E4640",
              fontFamily: "Work Sans",
              color: "#1E4640",
            }}
          >
            Cancel
          </Button>

          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            style={{
              height: 44,
              width: 120,
              borderRadius: 8,
              backgroundColor: "#0B5447",
              fontFamily: "Work Sans",
            }}
          >
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddFlashCardModal;
