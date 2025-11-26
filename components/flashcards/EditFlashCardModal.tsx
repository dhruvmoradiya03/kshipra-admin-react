import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, message, Col, Row } from "antd";
import { Work_Sans } from "next/font/google";
import { getTopics } from "@/service/api/config.api";

const { TextArea } = Input;
const { Option } = Select;

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

interface Flashcard {
  id: string;
  subjectId: string;
  topicId: string;
  question: string;
  answer: string;
  category?: string;
}

interface EditFlashCardModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  flashcard: Flashcard | null;
  subjects: Subject[];
  topics: Topic[];
}

const EditFlashCardModal: React.FC<EditFlashCardModalProps> = ({
  visible,
  onCancel,
  onSave,
  flashcard,
  subjects,
  topics,
}) => {
  const [form] = Form.useForm();
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [topic, setTopic] = useState<any>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  useEffect(() => {
    const fetchTopicsForSubject = async () => {
      if (selectedSubject) {
        try {
          const topics = await getTopics(selectedSubject);
          setTopic(topics);
        } catch (error) {
          console.error("Error fetching topics:", error);
        }
      } else {
        setTopic([]);
      }
    };

    fetchTopicsForSubject();
  }, [selectedSubject]);

  useEffect(() => {
    if (visible && flashcard) {
      setSelectedSubject(flashcard.subjectId);

      form.setFieldsValue({
        subjectId: flashcard.subjectId,
        topicId: flashcard.topicId,
        question: flashcard.question,
        answer: flashcard.answer,
        category: flashcard.category || "",
      });
    } else {
      form.resetFields();
      setFilteredTopics([]);
      setSelectedSubject(null);
    }
  }, [visible, flashcard, form]);

  const handleSubjectChange = async (subjectId: string) => {
    setSelectedSubject(subjectId);
    form.setFieldsValue({ topicId: undefined });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await onSave({
        ...values,
        id: flashcard?.id,
      });
      message.success("Flashcard updated successfully!");
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!flashcard) return null;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
      className="rounded-lg"
    >
      <h2 className="text-[#1E4640] font-medium text-2xl">Edit Flashcard</h2>

      <Form form={form} layout="vertical" className="mt-4 box-border">
        {/* SUBJECT + TOPIC ROW */}
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item
              name="subjectId"
              label="Subject"
              rules={[{ required: true, message: "Please select subject" }]}
              className={`font-medium text-[#1E4640] ${worksans.className}`}
            >
              <Select
                placeholder="Select Subject"
                className="h-[45px] rounded-lg font-400"
                onChange={handleSubjectChange}
                options={subjects?.map((item: any) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="topicId"
              label="Topic"
              rules={[{ required: true, message: "Please select topic" }]}
              className={`font-medium text-[#1E4640] ${worksans.className}`}
            >
              <Select
                placeholder="Select Topic"
                className="h-[45px] rounded-lg font-400"
                options={filteredTopics?.map((item: any) => ({
                  label: item.name,
                  value: item.id,
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
              rules={[{ required: true, message: "Please select note title" }]}
              className={`font-medium text-[#1E4640] ${worksans.className}`}
            >
              <Select
                placeholder="Select Note Title"
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
          rules={[{ required: true, message: "Please enter a question" }]}
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
          rules={[{ required: true, message: "Please enter an answer" }]}
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
      </Form>

      {/* FOOTER BUTTONS */}
      <div className="flex justify-end gap-4 mt-8">
        <Button
          onClick={onCancel}
          className="h-10 px-6 text-[#1E4640] font-medium border border-[#1E4640] rounded-lg"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          className="h-10 px-6 bg-[#1E4640] hover:bg-[#1E4640]/90 text-white font-medium rounded-lg"
          onClick={handleSubmit}
          loading={false}
        >
          Update Flashcard
        </Button>
      </div>
    </Modal>
  );
};

export default EditFlashCardModal;
