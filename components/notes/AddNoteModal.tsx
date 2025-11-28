import React, { useEffect, useState } from "react";
import {
  Modal,
  Input,
  Upload,
  Button,
  Form,
  Row,
  Col,
  Select,
  message,
  UploadFile,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Subject, Topic } from "./types";
import { Work_Sans } from "next/font/google";
import { getTopics, handleUpload } from "@/service/api/config.api";

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

interface AddNoteModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  loading?: boolean;
  subject: Subject[];
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  visible,
  onCancel,
  onSave,
  loading,
  subject,
}) => {
  const [form] = Form.useForm();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [topic, setTopic] = useState<any>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  // Reset form and clear validation errors when modal is opened
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedSubject(null);
      setTopic([]);
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // If there's a file to upload, upload it first
      if (fileList.length > 0 && fileList[0].originFileObj) {
        setIsUploading(true);
        try {
          const fileUrl = await handleUpload(
            fileList[0].originFileObj,
            "notes"
          );
          values.file = fileUrl; // Update the file URL with the uploaded file
        } catch (error) {
          console.error("Error uploading file:", error);
          message.error("Failed to upload file. Please try again.");
          return; // Don't proceed if file upload fails
        } finally {
          setIsUploading(false);
        }
      }

      form.resetFields();
      setFileList([]);
      onSave(values);
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleFileChange = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    if (info.file) {
      // Only allow one file
      if (info.fileList.length > 1) {
        message.warning(
          "Only one file can be uploaded at a time. The previous file will be replaced."
        );
        // Keep only the last selected file
        const lastFile = info.fileList[info.fileList.length - 1];
        setFileList([lastFile]);
      } else {
        setFileList([info.file]);
      }
      // Clear the link input when a file is selected
      form.setFieldsValue({ pdfLink: "" });
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
      <h2 className="text-[#1E4640] font-medium text-2xl">Add a single note</h2>

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
                options={subject?.map((item: any) => ({
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
          name="pdfLink"
          label="PDF File (Link or Upload)"
          rules={[
            {
              validator: (_, value) => {
                if (!value && fileList.length === 0) {
                  return Promise.reject(
                    "Please add a PDF link or upload a file"
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          className={`font-medium text-[#1E4640] ${worksans.className}`}
        >
          <div className="flex gap-3">
            <Input
              placeholder="Or paste PDF link here"
              style={{
                height: 45,
                borderRadius: 8,
                fontFamily: "Work Sans",
                fontWeight: 400,
              }}
              disabled={fileList.length > 0}
              onChange={(e) => {
                if (e.target.value) {
                  setFileList([]); // Clear file list when typing in the link
                }
              }}
            />

            <Upload
              beforeUpload={(file) => {
                if (file.type !== "application/pdf") {
                  message.error("You can only upload PDF files!");
                  return Upload.LIST_IGNORE;
                }
                handleFileChange({ file, fileList: [file] });
                return false;
              }}
              fileList={fileList}
              onRemove={() => {
                setFileList([]);
                return true;
              }}
              maxCount={1}
              accept=".pdf"
            >
              <Button
                icon={<UploadOutlined />}
                style={{
                  height: 45,
                  borderRadius: 8,
                  paddingInline: 20,
                  fontFamily: "Work Sans",
                }}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload PDF"}
              </Button>
            </Upload>
          </div>
          {fileList.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Selected file: {fileList[0].name}
            </div>
          )}
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

export default AddNoteModal;
