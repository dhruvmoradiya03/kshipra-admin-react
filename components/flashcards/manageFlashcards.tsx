"use client";

import Image from "next/image";
import { Work_Sans } from "next/font/google";
import { Dropdown, Space, Button } from "antd";
import { DownOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import FlashCardList from "./FlashCardList";
import AddFlashCardModal from "./AddFlashCardModal";
import EditFlashCardModal from "./EditFlashCardModal";
import DeleteFlashCardModal from "./DeleteFlashCardModal";
import { getSubjects, getTopics } from "@/service/api/config.api";
import "./flashcard.css";
import {
  addFlashcard,
  deleteFlashcard,
  getFlashcards,
  getFlashcardsBySubjectId,
  getFlashcardsByTopicId,
  updateFlashcard,
} from "@/service/api/flashcard.api";
import UploadFlashCardModal from "./UploadCardModal";

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

const ManageFlashcards = () => {
  const [subject, setSubject] = useState<any>([]);
  const [topic, setTopic] = useState<any>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  const [flashcardList, setFlashcardList] = useState<any>([]);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<any>(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    lastVisible: null as any,
  });

  const fetchSubjects = async () => {
    try {
      const subjects = await getSubjects();
      setSubject(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [selectedSubject]);

  const fetchTopics = async () => {
    try {
      if (!selectedSubject) return;

      console.log(selectedSubject);
      const topics = await getTopics(selectedSubject);

      console.log(topics, "this is topics");
      setTopic(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchFlashcards = async (
    page = pagination.page,
    pageSize = pagination.pageSize,
    lastVisible = pagination.lastVisible
  ) => {
    try {
      setLoading(true);

      console.log(page, pageSize, lastVisible);
      if (selectedSubject && selectedTopic) {
        const flashcards: any = await getFlashcardsByTopicId(
          selectedTopic,
          page,
          pageSize,
          lastVisible
        );
        setFlashcardList(flashcards.data);
        setPagination((prev) => ({
          ...prev,
          total: flashcards.total,
          page: flashcards.page,
          pageSize: flashcards.pageSize,
          lastVisible: flashcards.lastVisible,
        }));
      } else if (selectedSubject) {
        const flashcards: any = await getFlashcardsBySubjectId(
          selectedSubject,
          page,
          pageSize,
          lastVisible
        );
        setFlashcardList(flashcards.data);
        setPagination((prev) => ({
          ...prev,
          total: flashcards.total,
          page: flashcards.page,
          pageSize: flashcards.pageSize,
          lastVisible: flashcards.lastVisible,
        }));
      } else {
        console.log("No flashcards found");
        setFlashcardList([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          page: 1,
          pageSize: 10,
          lastVisible: null,
        }));
        return;
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log(flashcardList, "this is flashcardList");

  useEffect(() => {
    fetchFlashcards();
  }, [selectedSubject, selectedTopic]);

  useEffect(() => {
    fetchSubjects();
    fetchTopics();
  }, []);

  // Handle subject change
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedTopic(null);
  };

  // Handle topic change
  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  // Handle add flashcard
  const handleAddFlashcard = async (values: any) => {
    try {
      setLoading(true);
      const response = await addFlashcard({
        subjectId: values.subject,
        topicId: values.topic,
        noteId: values.note,
        question: values.question,
        answer: values.answer,
        category: values.category,
      });

      console.log(response, "this is response");
    } catch (error) {
      console.error("Error adding flashcard:", error);
    } finally {
      setLoading(false);
    }

    setIsAddModalVisible(false);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    const resetLastVisible = page === 1 ? null : pagination.lastVisible;

    setPagination((prev) => ({
      ...prev,
      current: page,
      ...(pageSize && { pageSize }),
      lastVisible: resetLastVisible,
    }));
    fetchFlashcards(page, pageSize);
  };

  const handleViewClick = (flashcard: any) => {
    // In a real app, this would open the note in a viewer
    console.log("Viewing flashcard:", flashcard);
  };

  // Handle edit flashcard
  const handleEditFlashcard = async (values: any) => {
    console.log("Updating flashcard:", values);

    try {
      setLoading(true);
      const response = await updateFlashcard(values.id, values);
      console.log(response, "this is response");
    } catch (error) {
      console.error("Error updating flashcard:", error);
    } finally {
      setLoading(false);
    }

    setIsEditModalVisible(false);
    setCurrentFlashcard(null);
  };

  const handleUploadFlashcard = (values: any) => {
    console.log(values, "this is values");
    setIsUploadModalVisible(false);
  };

  // Handle delete flashcard
  const handleDeleteFlashcard = async () => {
    console.log("Deleting flashcard:", currentFlashcard?.id);

    try {
      setLoading(true);
      const response = await deleteFlashcard(currentFlashcard?.id);
      console.log(response, "this is response");
    } catch (error) {
      console.error("Error deleting flashcard:", error);
    } finally {
      setLoading(false);
    }

    setIsDeleteModalVisible(false);
    setCurrentFlashcard(null);
  };

  // Handle edit button click
  const handleEditClick = (flashcard: any) => {
    setCurrentFlashcard(flashcard);
    setIsEditModalVisible(true);
  };

  // Handle delete button click
  const handleDeleteClick = (flashcard: any) => {
    setCurrentFlashcard(flashcard);
    setIsDeleteModalVisible(true);
  };

  return (
    <div
      className={`flex flex-col px-6 py-4 bg-[#F5F6F7] h-full ${worksans.className}`}
    >
      <div className="h-[12%] w-full items-center justify-center flex ">
        <div className="flex justify-between w-full items-center">
          <div
            className={`text-[#1E4640] ${worksans.className} font-semibold text-2xl`}
          >
            Flashcard Management
          </div>
          <div className="relative rounded-xl shadow-[0px_0px_4px_0px_#1E464040]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Image
                src="/images/search.svg"
                width={16}
                height={16}
                alt="search"
              />
            </div>
            <input
              type="text"
              className="pl-12 p-3 rounded-xl w-[350px] text-black"
              placeholder="Search For FlashCards"
            />
          </div>
        </div>
      </div>
      <div
        className={`h-[88%] w-full flex flex-col bg-white rounded-3xl overflow-hidden ${worksans.className}`}
      >
        <div className="h-[14%] w-full flex-shrink-0 px-5 py-4">
          <div className="h-full w-full flex justify-between items-center">
            <div className="flex gap-4">
              <Dropdown
                menu={{
                  items: subject.map((item: any) => ({
                    key: item.document_id,
                    label: item.name,
                  })),
                  selectable: true,
                  onSelect: (e) => handleSubjectChange(e.key),
                }}
                trigger={["click"]}
                overlayClassName="w-[200px]"
              >
                <div className="flex items-center justify-between w-[230px] border border-gray-300 rounded-xl py-3 px-4 text-[#1E4640] bg-white cursor-pointer hover:border-[#1E4640] transition-colors">
                  <span>
                    {selectedSubject
                      ? subject.find(
                          (s: any) => s.document_id === selectedSubject
                        )?.name || "Select Subject"
                      : "Select Subject"}
                  </span>
                  <DownOutlined className="text-xs" />
                </div>
              </Dropdown>
              <Dropdown
                menu={{
                  items: topic.map((item: any) => ({
                    key: item.document_id,
                    label: item.name,
                  })),
                  selectable: true,
                  disabled: !selectedSubject,
                  onSelect: (e) => {
                    setSelectedTopic(e.key);
                  },
                }}
                trigger={["click"]}
                overlayClassName="w-[200px]"
              >
                <div
                  className={`flex items-center justify-between w-[230px] border ${
                    !selectedSubject
                      ? "border-gray-200"
                      : "border-gray-300 hover:border-[#1E4640]"
                  } rounded-xl py-3 px-4 ${
                    !selectedSubject ? "text-gray-400" : "text-[#1E4640]"
                  } bg-white cursor-pointer transition-colors`}
                >
                  <span>
                    {selectedTopic
                      ? topic.find((t: any) => t.document_id === selectedTopic)
                          ?.name || "Select Topic"
                      : "Select Topic"}
                  </span>
                  <DownOutlined className="text-xs" />
                </div>
              </Dropdown>
            </div>

            <div className="relative h-full flex gap-4">
              <div className="flex items-center gap-2 shadow-[0px_0px_4px_0px_#1E464040] hover:shadow-[0px_2px_8px_0px_#1E464060] px-4 gap-2 cursor-pointer rounded-xl items-center justify-center flex bg-white transition-all duration-300 hover:-translate-y-0.2">
                <Image
                  src="/images/plus.svg"
                  width={20}
                  height={20}
                  alt="plus"
                />
                <button
                  className="text-[#1E4640] font-medium"
                  onClick={() => setIsAddModalVisible(true)}
                >
                  Add Flashcard
                </button>
              </div>
              <button
                className="text-[#1E4640] bg-[#1E4640] font-medium shadow-[0px_0px_4px_0px_#1E464040] hover:shadow-[0px_2px_8px_0px_#1E464060] px-6 cursor-pointer text-white rounded-xl items-center justify-center flex transition-all duration-300 hover:-translate-y-0.2"
                onClick={() => setIsUploadModalVisible(true)}
              >
                Upload via CSV
              </button>
            </div>
          </div>
        </div>
        <div className="h-full flex-1 w-full flex bg-white px-4">
          {selectedSubject === null && (
            <div className="flex flex-col items-center justify-center gap-4 w-full">
              <Image
                src="/images/no_content.svg"
                width={100}
                height={100}
                alt="No content available"
                priority
              />
              <div className="text-[#1E4640] font-bold text-2xl text-center">
                No Subject Selected!
              </div>
              <div className="text-[#758382] text-center w-[35%]">
                Select a Subject from the Dropdown above to view its associated
                topics and notes
              </div>
            </div>
          )}

          {selectedSubject !== null &&
            (flashcardList.length > 0 ? (
              <div className="w-full">
                <FlashCardList
                  flashcards={flashcardList}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onView={handleViewClick}
                  loading={loading}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 w-full">
                <Image
                  src="/images/no_content.svg"
                  width={100}
                  height={100}
                  alt="No content available"
                  priority
                />
                <div className="text-[#1E4640] font-bold text-2xl text-center">
                  No Flashcards Found!
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add Flashcard Modal */}
      <AddFlashCardModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSave={handleAddFlashcard}
        subjects={subject}
        topics={topic}
      />

      <UploadFlashCardModal
        visible={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        onSave={handleUploadFlashcard}
        subjects={subject}
        topics={topic}
      />

      {/* Edit Flashcard Modal */}
      {currentFlashcard && (
        <EditFlashCardModal
          visible={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setCurrentFlashcard(null);
          }}
          onSave={handleEditFlashcard}
          flashcard={currentFlashcard}
          subjects={subject}
          topics={topic}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteFlashCardModal
        visible={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setCurrentFlashcard(null);
        }}
        onConfirm={handleDeleteFlashcard}
      />
    </div>
  );
};

export default ManageFlashcards;
