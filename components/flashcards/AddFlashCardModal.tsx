import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, Input, Select, Button, Col, Row, Spin } from "antd";
import { Work_Sans } from "next/font/google";
import { getTopics } from "@/service/api/config.api";
import { getNotes, getNotesByTopicId } from "@/service/api/notes.api";
import { debounce } from "lodash";

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
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [topic, setTopic] = useState<any>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    lastVisible: null as any,
  });

  const fetchTopics = async () => {
    try {
      const topics = await getTopics(selectedSubject);

      setTopic(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchNotes = async (isLoadMore = false) => {
    try {
      if (!selectedTopic) return;

      setLoadingDropdown(true);
      const { page, pageSize, lastVisible } = isLoadMore
        ? { ...pagination, page: pagination.page + 1 }
        : { ...pagination, page: 1 };

      const response = await getNotesByTopicId(
        selectedTopic,
        page,
        pageSize,
        lastVisible
      );

      if (isLoadMore) {
        setNotes((prevNotes) => [...prevNotes, ...response.data]);
      } else {
        setNotes(response.data);
      }

      setPagination({
        page,
        pageSize,
        total: response.total,
        lastVisible: response.lastVisible,
      });
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoadingDropdown(false);
    }
  };

  // Debounced version of fetchNotes for better performance
  const debouncedFetchNotes = useMemo(
    () => debounce(fetchNotes, 300),
    [selectedTopic, pagination]
  );

  // Handle scroll event for infinite loading
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { target } = e;
    const scrollElement = target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollThreshold = 50; // pixels from bottom

    if (
      !loadingDropdown &&
      pagination.page * pagination.pageSize < pagination.total &&
      scrollTop + clientHeight >= scrollHeight - scrollThreshold
    ) {
      fetchNotes(true);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [selectedSubject]);

  useEffect(() => {
    // Reset pagination when topic changes
    setPagination({
      page: 1,
      pageSize: 10,
      total: 0,
      lastVisible: null,
    });
    setNotes([]);
    if (selectedTopic) {
      fetchNotes();
    }
  }, [selectedTopic]);

  useEffect(() => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setTopic([]);
    setNotes([]);

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchNotes.cancel();
    };
  }, []);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        onSave(values);
      })
      .catch(() => {});

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
                  topicId: item.document_id,
                  value: item.document_id,
                }))}
                onChange={(value) => setSelectedTopic(value)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col className="w-full">
            <Form.Item
              name="note"
              label="Note Title"
              rules={[{ required: true, message: "Enter note title" }]}
              className={`font-medium text-[#1E4640] ${worksans.className}`}
            >
              <Select
                placeholder="Select Note"
                className="h-[45px] rounded-lg font-400 w-full [&_.ant-select-selector]:h-full [&_.ant-select-selection-item]:h-full [&_.ant-select-selection-item]:flex [&_.ant-select-selection-item]:items-center"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                listHeight={250}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ padding: 0 }}
                popupClassName="[&_.ant-select-item-option-content]:whitespace-normal"
                onPopupScroll={handlePopupScroll}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    {/* {loadingDropdown && (
                      <div className="flex justify-center p-2">
                        <Spin size="small" />
                      </div>
                    )} */}
                    {/* {!loadingDropdown &&
                      pagination.page * pagination.pageSize >=
                        pagination.total &&
                      pagination.total > 0 && (
                        <div className="text-center p-2 text-gray-500 text-sm">
                          No more notes
                        </div>
                      )} */}
                    {/* {!loadingDropdown && notes.length === 0 && (
                      <div className="text-center p-2 text-gray-500 text-sm">
                        No notes found
                      </div>
                    )} */}
                  </>
                )}
                options={notes.map((item: any) => ({
                  label: item.title,
                  value: item.document_id,
                }))}
                onChange={(value) => setSelectedNote(value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="question"
          label="Question"
          rules={[{ required: true, message: "Add Question" }]}
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
