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

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

const dummyFlashcards = [
  {
    id: "f1",
    subjectId: "1",
    topicId: "t1",
    noteId: "n1",
    question: "What is the quadratic formula?",
    answer: "x = [-b ± √(b² - 4ac)] / (2a)",
    category: "Mathematics",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "f2",
    subjectId: "2",
    topicId: "t3",
    noteId: "n2",
    question: "What is Newton's first law of motion?",
    answer:
      "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.",
    category: "Physics",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const ManageFlashcards = () => {
  const [subject, setSubject] = useState<any>([]);
  const [topic, setTopic] = useState<any>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  const [flashcardList, setFlashcardList] = useState(dummyFlashcards);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<any>(null);

  const [loading, setLoading] = useState(false);

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
    // Filter flashcards based on selected topic
    const filteredFlashcards = dummyFlashcards.filter(
      (flashcard) => flashcard.topicId === topicId
    );
    setFlashcardList(filteredFlashcards);
  };

  // Handle add flashcard
  const handleAddFlashcard = (values: any) => {
    console.log("Adding flashcard:", values);
    // In a real app, this would call the API
    setIsAddModalVisible(false);
  };

  const handleViewClick = (flashcard: any) => {
    // In a real app, this would open the note in a viewer
    console.log("Viewing flashcard:", flashcard);
  };

  // Handle edit flashcard
  const handleEditFlashcard = (values: any) => {
    console.log("Updating flashcard:", values);
    // In a real app, this would call the API
    setIsEditModalVisible(false);
    setCurrentFlashcard(null);
  };

  // Handle delete flashcard
  const handleDeleteFlashcard = () => {
    console.log("Deleting flashcard:", currentFlashcard?.id);
    // In a real app, this would call the API
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
                onClick={() => setIsAddModalVisible(true)}
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
                  No Notes Found!
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
        flashcard={currentFlashcard}
      />
    </div>
  );
};

export default ManageFlashcards;
