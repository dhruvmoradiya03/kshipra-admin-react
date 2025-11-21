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

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

const subject = [
  { name: "Anatomy", id: 1 },
  { name: "Pharmacy", id: 2 },
  { name: "Botany", id: 3 },
  { name: "Zoology", id: 4 },
];
const topic = [
  { id: 1, name: "test1", subject: 1 },
  { id: 2, name: "test5", subject: 1 },
  { id: 3, name: "test6", subject: 1 },

  { id: 4, name: "test2", subject: 2 },
  { id: 5, name: "test7", subject: 2 },
  { id: 6, name: "test8", subject: 2 },

  { id: 7, name: "test3", subject: 3 },
  { id: 8, name: "test9", subject: 3 },
  { id: 9, name: "test10", subject: 3 },

  { id: 10, name: "test4", subject: 4 },
  { id: 11, name: "test11", subject: 4 },
  { id: 12, name: "test12", subject: 4 },
];

const notes = [
  {
    subject: 1,
    topic: 1,
    title: "test1",
    file: "test1.pdf",
  },
  {
    subject: 1,
    topic: 2,
    title: "test2",
    file: "test2.pdf",
  },
  {
    subject: 1,
    topic: 3,
    title: "test3",
    file: "test3.pdf",
  },
  { subject: 2, topic: 4, title: "test4", file: "test4.pdf" },
  { subject: 2, topic: 5, title: "test5", file: "test5.pdf" },
  { subject: 2, topic: 6, title: "test6", file: "test6.pdf" },
  { subject: 3, topic: 7, title: "test7", file: "test7.pdf" },
  { subject: 3, topic: 8, title: "test8", file: "test8.pdf" },
  { subject: 3, topic: 9, title: "test9", file: "test9.pdf" },
  { subject: 4, topic: 10, title: "test10", file: "test10.pdf" },
  { subject: 4, topic: 11, title: "test11", file: "test11.pdf" },
  { subject: 4, topic: 12, title: "test12", file: "test12.pdf" },
];

const ManageNotes = () => {
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [noteList, setNoteList] = useState<any>([]);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSubject && selectedTopic) {
      const filteredNotes = notes.filter(
        (note) =>
          note.subject === selectedSubject && note.topic === selectedTopic
      );
      setNoteList(filteredNotes);
    } else if (selectedSubject) {
      const filteredNotes = notes.filter(
        (note) => note.subject === selectedSubject
      );
      setNoteList(filteredNotes);
    } else {
      setNoteList([]);
    }
  }, [selectedSubject, selectedTopic]);

  // Filter topics based on selected subject
  const filteredTopics = selectedSubject
    ? topic.filter((t) => t.subject === selectedSubject)
    : [];

  // Handle subject change
  const handleSubjectChange = (subjectId: number) => {
    setSelectedSubject(subjectId);
    setSelectedTopic(null); // Reset topic when subject changes
  };

  const handleAddNote = (values: any) => {
    // In a real app, this would be an API call
    const newNote = {
      id: noteList.length + 1,
      subject: selectedSubject!,
      topic: selectedTopic!,
      title: values.title,
      description: values.description,
      file: values.file[0]?.name || "new_note.pdf",
      date: new Date().toISOString().split("T")[0],
    };

    setNoteList([...noteList, newNote]);
    setIsAddModalVisible(false);
  };

  const handleEditNote = (values: any) => {
    // In a real app, this would be an API call
    const updatedNotes = noteList.map((note: any) =>
      note.id === currentNote?.id
        ? { ...note, ...values, file: values.file[0]?.name || note.file }
        : note
    );

    setNoteList(updatedNotes);
    setIsEditModalVisible(false);
    setCurrentNote(null);
  };

  const handleDeleteNote = () => {
    // In a real app, this would be an API call
    // if (currentNote) {
    //   const updatedNotes = noteList.filter(
    //     (note: any) => note.id !== currentNote.id
    //   );
    //   setNoteList(updatedNotes);
    //   setIsDeleteModalVisible(false);
    //   setCurrentNote(null);
    // }

    setIsDeleteModalVisible(false);
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
                  items: subject.map((item) => ({
                    key: item.id,
                    label: item.name,
                  })),
                  selectable: true,
                  onSelect: (e) => handleSubjectChange(Number(e.key)),
                }}
                trigger={["click"]}
                overlayClassName="w-[200px]"
              >
                <div className="flex items-center justify-between w-[200px] border border-gray-300 rounded-xl py-3 px-4 text-[#1E4640] bg-white cursor-pointer hover:border-[#1E4640] transition-colors">
                  <span>
                    {selectedSubject
                      ? subject.find((s) => s.id === selectedSubject)?.name ||
                        "Select Subject"
                      : "Select Subject"}
                  </span>
                  <DownOutlined className="text-xs" />
                </div>
              </Dropdown>
              <Dropdown
                menu={{
                  items: filteredTopics.map((item) => ({
                    key: item.id.toString(),
                    label: item.name,
                  })),
                  selectable: true,
                  disabled: !selectedSubject,
                  onSelect: (e) => setSelectedTopic(Number(e.key)),
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
                      ? filteredTopics.find((t) => t.id === selectedTopic)
                          ?.name || "Select Topic"
                      : "Select Topic"}
                  </span>
                  <DownOutlined className="text-xs" />
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
        <div className="h-full flex-1 w-full flex bg-white p-5">
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

          {selectedSubject !== null && noteList.length > 0 && (
            <div className="w-full">
              <NotesList
                notes={noteList}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onView={handleViewClick}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      <AddNoteModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={handleAddNote}
        loading={loading}
        subject={subject} // Passing the subject constant defined at the top
        topic={topic} // Passing the topic constant defined at the top
      />

      {/* Edit Note Modal */}
      {currentNote && (
        <EditNoteModal
          visible={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setCurrentNote(null);
          }}
          onSubmit={handleEditNote}
          note={currentNote}
          subjects={subject}
          topics={topic}
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
