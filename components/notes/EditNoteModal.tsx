"use client";
import React, { useEffect, useState } from "react";
import { Modal, Input, Upload, Button, Form, Select, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Work_Sans } from "next/font/google";
import { getTopics } from "@/service/api/config.api";

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

interface EditNoteModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  note: any;
  loading?: boolean;
  subjects: any[];
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  visible,
  onCancel,
  onSave,
  note,
  loading,
  subjects,
}) => {
  const [form] = Form.useForm();

  const [selectedSubject, setSelectedSubject] = useState<any>(null);
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
    if (note) {
      // First set the selected subject and topic states
      setSelectedSubject(note.subjectId);

      console.log(note.file, "[][][][]this is done");

      // Then set the form values
      form.setFieldsValue({
        subject: note.subjectId || "",
        topic: note.topicId || "",
        title: note.title || "",
        file: note.file || "",
      });

      // If there's a subject, fetch its topics
      if (note.subjectId) {
        getTopics(note.subjectId).then((topics) => {
          setTopic(topics);
          // Set the topic after topics are loaded
          setSelectedTopic(note.topicId);
        });
      }
    }
  }, [note, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave({ ...values, id: note?.document_id });
      onCancel();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={onCancel}
      width={500}
      centered
      className="custom-note-modal"
    >
      <h2 className="text-[#1E4640] font-medium text-2xl">
        Edit a single note
      </h2>

      <Form form={form} layout="vertical" className="mt-4">
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
                value={selectedSubject}
                onChange={(value) => {
                  setSelectedSubject(value);
                  setSelectedTopic(null); // Reset topic when subject changes
                  form.setFieldsValue({ topic: undefined }); // Clear the topic field
                }}
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
                loading={!topic}
                options={topic?.map((item: any) => ({
                  label: item.name,
                  value: item.document_id,
                }))}
                value={selectedTopic}
                onChange={(value) => setSelectedTopic(value)}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* FILE TITLE */}
        <Form.Item
          name="title"
          label="PDF File Title"
          rules={[{ required: true, message: "Enter file title" }]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <Input
            placeholder="Enter File Title"
            style={{
              height: 45,
              borderRadius: 8,
              fontFamily: "Work Sans",
              fontWeight: 400,
            }}
          />
        </Form.Item>

        {/* FILE LINK + UPLOAD BUTTON */}
        <Form.Item
          name="file"
          label="Add PDF File Link"
          rules={[{ required: true, message: "Add Link" }]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <div className="flex gap-3">
            <Input
              value={note.file}
              placeholder="Add Link"
              style={{
                height: 45,
                borderRadius: 8,
                fontFamily: "Work Sans",
                fontWeight: 400,
              }}
            />

            <Upload beforeUpload={() => false} showUploadList={false}>
              <Button
                icon={<UploadOutlined />}
                style={{
                  height: 45,
                  borderRadius: 8,
                  paddingInline: 20,
                  fontFamily: "Work Sans",
                }}
              >
                Upload
              </Button>
            </Upload>
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

export default EditNoteModal;
