import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, message, Col, Row } from "antd";
import { Work_Sans } from "next/font/google";
import { getTopics } from "@/service/api/config.api";
import { getNotesByTopicId } from "@/service/api/notes.api";

const { TextArea } = Input;
const { Option } = Select;

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  created_at: string;
  document_id: string;
  is_active: boolean;
  order: number;
  subject_id: string;
  title: string;
  total_flashcards: number;
  total_notes: number;
  updated_at: string;
}

interface Flashcard {
  id: string;
  subject_id: string;
  topic_id: string;
  note_id: string;
  question_title: string;
  question: string;
  answer_title: string;
  answer: string;
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
}) => {
  const [form] = Form.useForm();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [currentTopicTitle, setCurrentTopicTitle] = useState<string>("");

  // Fetch topics when subject changes
  useEffect(() => {
    const fetchTopicsForSubject = async () => {
      if (selectedSubject) {
        try {
          const topicsData = await getTopics(selectedSubject);
          setTopics(topicsData);
        } catch (error) {
          console.error("Error fetching topics:", error);
          message.error("Failed to load topics");
        }
      } else {
        setTopics([]);
        setNotes([]);
      }
    };

    fetchTopicsForSubject();
  }, [selectedSubject]);

  // Fetch notes when topic changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (selectedTopic) {
        setIsLoadingNotes(true);
        try {
          const notesData = await getNotesByTopicId(selectedTopic);
          setNotes(notesData.data);
        } catch (error) {
          console.error("Error fetching notes:", error);
          message.error("Failed to load notes");
        } finally {
          setIsLoadingNotes(false);
        }
      } else {
        setNotes([]);
      }
    };

    fetchNotes();
  }, [selectedTopic]);

  // Update current topic title when topics or selected topic changes
  useEffect(() => {
    if (selectedTopic && topics.length > 0) {
      const topic = topics.find(
        (t) => t.document_id === selectedTopic || t.id === selectedTopic
      );
      if (topic) {
        setCurrentTopicTitle(topic.name);
      }
    } else {
      setCurrentTopicTitle("");
    }
  }, [selectedTopic, topics]);

  // Initialize form with flashcard data
  useEffect(() => {
    if (visible && flashcard) {
      // Set the selected subject and topic
      setSelectedSubject(flashcard.subject_id);
      setSelectedTopic(flashcard.topic_id);

      // Set form values
      form.setFieldsValue({
        subject: flashcard.subject_id,
        topic: flashcard.topic_id,
        note: flashcard.note_id,
        questionTitle: flashcard.question_title,
        question: flashcard.question,
        answerTitle: flashcard.answer_title,
        answer: flashcard.answer,
      });
    } else {
      // Reset form and states when modal is closed
      form.resetFields();
      setSelectedSubject(null);
      setSelectedTopic(null);
      setNotes([]);
    }
  }, [visible, flashcard, form]);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedTopic(null);
    setNotes([]);
    form.setFieldsValue({
      topic: undefined,
      note: undefined,
    });
  };

  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId);
    form.setFieldsValue({ note: undefined });

    // Update current topic title
    const selected = topics.find(
      (t) => t.document_id === topicId || t.id === topicId
    );
    setCurrentTopicTitle(selected?.title || "");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Transform form field names to database field names
      const transformedValues = {
        id: flashcard?.id,
        subject_id: values.subject,
        topic_id: values.topic,
        note_id: values.note,
        question_title: values.questionTitle,
        question: values.question,
        answer_title: values.answerTitle,
        answer: values.answer,
      };
      
      await onSave(transformedValues);
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
              name="subject"
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
                  value: item.document_id,
                }))}
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
                onChange={handleTopicChange}
                loading={!selectedSubject}
                options={topics?.map((item: any) => ({
                  label: item.title,
                  value: item.document_id || item.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={20}>
          <Col className="w-full">
            <Form.Item
              name="note"
              label="Select Note"
              rules={[{ required: true, message: "Please select a note" }]}
              className={`font-medium text-[#1E4640] ${worksans.className}`}
            >
              <Select
                placeholder={
                  isLoadingNotes ? "Loading notes..." : "Select Note"
                }
                className="h-[45px] rounded-lg font-400"
                loading={isLoadingNotes}
                disabled={!selectedTopic}
                options={notes.map((note) => ({
                  label: note.title,
                  value: note.document_id || note.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="questionTitle"
          label="Question Title"
          rules={[{ required: true, message: "Please enter a question title" }]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <Input
            placeholder="Add Question Title"
            style={{
              height: 45,
              borderRadius: 8,
              fontFamily: "Work Sans",
              fontWeight: 400,
            }}
          />
        </Form.Item>

        <Form.Item
          name="question"
          label="Question"
          rules={[{ required: true, message: "Please enter a question" }]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <Input
            placeholder="Add Question"
            style={{
              height: 45,
              borderRadius: 8,
              fontFamily: "Work Sans",
              fontWeight: 400,
            }}
          />
        </Form.Item>

        <Form.Item
          name="answerTitle"
          label="Answer Title"
          rules={[{ required: true, message: "Please enter an answer title" }]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <Input
            placeholder="Add Answer Title"
            style={{
              height: 45,
              borderRadius: 8,
              fontFamily: "Work Sans",
              fontWeight: 400,
            }}
          />
        </Form.Item>

        <Form.Item
          name="answer"
          label="Answer"
          rules={[{ required: true, message: "Please enter an answer" }]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <Input
            placeholder="Add Answer"
            style={{
              height: 45,
              borderRadius: 8,
              fontFamily: "Work Sans",
              fontWeight: 400,
            }}
          />
        </Form.Item>

      </Form>

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
    </Modal>
  );
};

export default EditFlashCardModal;
