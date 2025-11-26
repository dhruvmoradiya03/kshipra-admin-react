"use client";

import Image from "next/image";
import { Work_Sans } from "next/font/google";
import type { MenuProps } from "antd";
import { Dropdown, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import NotesList from "./NotesList";
import AddNoteModal from "./AddNoteModal";
import EditNoteModal from "./EditNoteModal";
import DeleteNoteModal from "./DeleteNoteModal";
import {
  addNote,
  deleteNote,
  getNotes,
  getNotesBySubjectId,
  getNotesByTopicId,
  updateNote,
} from "@/service/api/notes.api";
import { getSubjects, getTopics } from "@/service/api/config.api";

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

const ManageNotes = () => {
  const [subject, setSubject] = useState<any>([]);
  const [topic, setTopic] = useState<any>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  const [noteList, setNoteList] = useState<any>([]);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    lastVisible: null as any,
  });

  const fetchNotes = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    lastVisible = pagination.lastVisible
  ) => {
    try {
      setLoading(true);
      console.log("Fetching notes...");

      let result;

      if (selectedSubject && selectedTopic) {
        result = await getNotesByTopicId(
          selectedTopic,
          page,
          pageSize,
          lastVisible
        );
      } else if (selectedSubject) {
        result = await getNotesBySubjectId(
          selectedSubject,
          page,
          pageSize,
          lastVisible
        );
      } else {
        // Handle case when neither subject nor topic is selected
        setNoteList([]);
        return;
      }

      setNoteList(result.data);
      setPagination((prev) => ({
        ...prev,
        total: result.total,
        current: page,
        pageSize,
        lastVisible: result.lastVisible,
      }));
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const subjects = await getSubjects();
      setSubject(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

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

  useEffect(() => {
    fetchTopics();
  }, [selectedSubject]);

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject, selectedTopic, pagination.pageSize, pagination.current]);

  const handlePageChange = (page: number, pageSize?: number) => {
    const resetLastVisible = page === 1 ? null : pagination.lastVisible;

    setPagination((prev) => ({
      ...prev,
      current: page,
      ...(pageSize && { pageSize }),
      lastVisible: resetLastVisible,
    }));
    fetchNotes(page, pageSize);
  };

  // Handle subject change
  const handleSubjectChange = (subjectId: string) => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
      lastVisible: null,
    });

    setSelectedSubject(subjectId);
    setSelectedTopic(null);
    fetchTopics();
  };

  const handleAddNote = async (values: any) => {
    const newNote = {
      subjectId: values.subject,
      topicId: values.topic,
      title: values.title,
      file: values.pdfLink || null,
    };

    try {
      setLoading(true);
      const result = await addNote(newNote);
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setLoading(false);
    }

    fetchNotes(pagination.current, pagination.pageSize, null);
    setIsAddModalVisible(false);
  };

  const handleEditNote = async (values: any) => {
    const updatedNote = {
      subjectId: values.subject,
      topicId: values.topic,
      title: values.title,
      file: values.file,
    };

    try {
      setLoading(true);
      const result = await updateNote(currentNote?.document_id, {
        ...updatedNote,
      });
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setLoading(false);
    }

    fetchNotes(pagination.current, pagination.pageSize, null);
    setIsEditModalVisible(false);
    setCurrentNote(null);
  };

  const handleDeleteNote = async () => {
    try {
      setLoading(true);
      const result = await deleteNote(currentNote?.document_id);
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setLoading(false);
    }

    fetchNotes(pagination.current, pagination.pageSize, null);

    setIsDeleteModalVisible(false);
    setCurrentNote(null);
  };

  const handleEditClick = (note: any) => {
    setCurrentNote(note);
    setIsEditModalVisible(true);
  };

  const handleDeleteClick = (note: any) => {
    setCurrentNote(note);
    setIsDeleteModalVisible(true);
  };

  const handleViewClick = (note: any) => {
    // In a real app, this would open the note in a viewer
    console.log("Viewing note:", note);
  };

  console.log(currentNote, "currentNote");

  return (
    <div className="flex flex-col px-6 py-4 bg-[#F5F6F7] h-full">
      <div className="h-[12%] w-full items-center justify-center flex ">
        <div className="flex justify-between w-full py-4">
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
              placeholder="Search For Notes"
            />
          </div>
          <div className="relative shadow-[0px_0px_4px_0px_#1E464040] hover:shadow-[0px_2px_8px_0px_#1E464060] px-4 gap-2 cursor-pointer rounded-xl items-center justify-center flex bg-white transition-all duration-300 hover:-translate-y-0.2">
            <Image src="/images/plus.svg" width={20} height={20} alt="plus" />
            <button
              className="text-[#1E4640] font-medium"
              onClick={() => setIsAddModalVisible(true)}
            >
              Add Notes
            </button>
          </div>
        </div>
      </div>
      <div className="h-[88%] w-full flex flex-col bg-white rounded-3xl overflow-hidden">
        <div className="h-[14%] w-full flex-shrink-0 px-5 py-4">
          <div className="h-full w-full flex justify-between items-center">
            <div
              className={`text-[#1E4640] ${worksans.className} font-medium text-2xl`}
            >
              Notes Management
            </div>
            <div className="flex gap-2">
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
                <div className="flex items-center justify-between w-[200px] border border-gray-300 rounded-xl py-3 px-4 text-[#1E4640] bg-white cursor-pointer hover:border-[#1E4640] transition-colors">
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
                    setPagination({
                      current: 1,
                      pageSize: 10,
                      total: 0,
                      lastVisible: null,
                    });
                    setSelectedTopic(e.key);
                  },
                }}
                trigger={["click"]}
                overlayClassName="w-[200px]"
              >
                <div
                  className={`flex items-center justify-between w-[200px] border ${
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
            (noteList.length > 0 ? (
              <div className="w-full">
                <NotesList
                  notes={noteList}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onView={handleViewClick}
                  loading={loading}
                  total={pagination.total}
                  currentPage={pagination.current}
                  pageSize={pagination.pageSize}
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
                  No Notes Found!
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add Note Modal */}
      <AddNoteModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSave={handleAddNote}
        loading={loading}
        subject={subject}
      />

      {/* Edit Note Modal */}
      {currentNote && (
        <EditNoteModal
          visible={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setCurrentNote(null);
          }}
          onSave={handleEditNote}
          note={currentNote}
          subjects={subject}
          loading={loading}
        />
      )}

      {currentNote && (
        <DeleteNoteModal
          visible={isDeleteModalVisible}
          onCancel={() => {
            setIsDeleteModalVisible(false);
            setCurrentNote(null);
          }}
          onConfirm={handleDeleteNote}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ManageNotes;
