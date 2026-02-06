"use client";

import Image from "next/image";
import { Work_Sans } from "next/font/google";
import { Dropdown, Space, Button, Pagination, message } from "antd";
import { DownOutlined, PlusOutlined, DragOutlined, SaveOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd/dist/index.js";
import { HTML5Backend } from "react-dnd-html5-backend";
import { debounce } from "lodash";
import MentorCard from "./MentorCard";
import AddMentor from "./AddMentor";
import RemoveMentorModal from "./RemoveMentorModal";
import {
  addMentor,
  getMentors,
  updateMentor,
  deleteMentor,
  updateMentorOrders,
} from "@/service/api/mentor.api";
import { handleImageUpload } from "@/service/api/config.api";

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

const manageMentor = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"list" | "add">("list");
  const [loading, setLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [mentorList, setMentorList] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderedMentors, setReorderedMentors] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Draggable Mentor Card Component
  const DraggableMentorCard = ({ mentor, index, moveMentor, isReordering }: any) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'mentor',
      item: { index },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: 'mentor',
      hover: (item: { index: number }) => {
        if (!isReordering) return;
        if (item.index !== index) {
          moveMentor(item.index, index);
          item.index = index;
        }
      },
    });

    return (
      <div
        ref={(node) => {
          if (isReordering) {
            drag(drop(node));
          }
        }}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <MentorCard
          key={mentor.id || index}
          name={mentor.name}
          imageUrl={mentor.image || "/images/dummy-mentor.png"}
          onMenuClick={() => console.log("Menu clicked")}
          onEdit={() => {
            const formValues = {
              ...mentor,
              sessionCards: mentor.sessionCard || [],
            };
            setSelectedMentor(formValues);
            setView("add");
          }}
          onDelete={() => {
            setSelectedMentor(mentor);
            handleDeleteClick();
          }}
          onClick={() => {
            const formValues = {
              ...mentor,
              sessionCards: mentor.sessionCard || [],
            };
            setSelectedMentor(formValues);
            setView("add");
          }}
        />
      </div>
    );
  };

  const fetchMentors = async (query: string = "") => {
    try {
      setLoading(true);
      console.log("Fetching mentors with query:", query);

      let result;

      result = await getMentors(query);

      if (!result || result.data.length === 0) {
        setMentorList([]);
        return;
      }

      setMentorList(result.data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        console.log("Searching for:", value);
        fetchMentors(value);
      }, 500),
    []
  );

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleAddMentor = async (values: any) => {
    try {
      setLoading(true);

      let imageUrl = values.image || null;
      console.log("Initial imageUrl from values:", imageUrl);
      console.log("ImageFile present?:", !!values.imageFile);

      if (values.imageFile) {
        imageUrl = await handleImageUpload(values.imageFile);
        console.log("Uploaded new image:", imageUrl);
      }
      console.log("Final imageUrl to save:", imageUrl);

      const mentorData = {
        name: values.name,
        image: imageUrl,
        emailId: values.emailId,
        shortBio: values.shortBio,
        rank: Array.isArray(values.rank) ? values.rank : [values.rank].filter(Boolean),
        speciality: values.speciality,
        expertise: Array.isArray(values.expertise) ? values.expertise : [values.expertise].filter(Boolean),
        sessionCard: values.sessionCards || [],
        schedule: values.schedule || [],
      };

      if (selectedMentor) {
        await updateMentor(selectedMentor.id, mentorData);
        setSuccessMessage("Mentor updated successfully.");
      } else {
        await addMentor(mentorData);
        setSuccessMessage("Mentor added successfully.");
      }

      setErrorMessage(null);
      setIsSuccessAlertOpen(true);
      setIsErrorAlertOpen(false);
      setView("list");
      setSelectedMentor(null);
    } catch (error) {
      console.error("Error saving mentor:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save mentor.";
      setErrorMessage(message);
      setSuccessMessage(null);
      setIsErrorAlertOpen(true);
      setIsSuccessAlertOpen(false);
    } finally {
      setLoading(false);
    }

    fetchMentors();
  };

  const handleEditClick = () => {
    // Dummy data for testing - in real app, pass the mentor object or fetch ID
    const dummyMentor = {
      name: "Dr. Ananya Sharma",
      rank: ["Senior Mentor", "Lead Counselor"],
      shortBio: "Experienced mentor with 10+ years in counseling.",
      speciality: "Career Guidance",
      expertise: ["Psychology", "Career Development", "Student Counseling"],
      emailId: "ananya@example.com",
      image: "/images/dummy-mentor.png",
      sessionCards: [{ duration: 30, fees: "500" }],
      // schedule: [] // Add if there's dummy schedule data
    };
    setSelectedMentor(dummyMentor);
    setView("add");
  };

  const handleDeleteClick = () => {
    setIsRemoveModalOpen(true);
  };

  const handleReorderClick = () => {
    setIsReordering(true);
    setReorderedMentors([...mentorList]);
    setHasChanges(false);
  };

  const handleSaveOrder = async () => {
    try {
      setLoading(true);
      const mentorOrders = reorderedMentors.map((mentor, index) => ({
        mentorId: mentor.id,
        order: index + 1,
      }));
      
      await updateMentorOrders(mentorOrders);
      setSuccessMessage("Mentor order updated successfully.");
      setErrorMessage(null);
      setIsSuccessAlertOpen(true);
      setIsReordering(false);
      setHasChanges(false);
      fetchMentors();
    } catch (error) {
      console.error("Error updating mentor order:", error);
      const message = error instanceof Error ? error.message : "Failed to update mentor order.";
      setErrorMessage(message);
      setIsErrorAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReorder = () => {
    setIsReordering(false);
    setReorderedMentors([]);
    setHasChanges(false);
  };

  const moveMentor = (dragIndex: number, hoverIndex: number) => {
    const dragItem = reorderedMentors[dragIndex];
    const newItems = [...reorderedMentors];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, dragItem);
    setReorderedMentors(newItems);
    setHasChanges(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMentor) return;
    try {
      setLoading(true);
      await deleteMentor(selectedMentor.id);
      setSuccessMessage("Mentor removed successfully.");
      setErrorMessage(null);
      setIsSuccessAlertOpen(true);
      setIsRemoveModalOpen(false);
      setSelectedMentor(null);
      fetchMentors();
    } catch (error) {
      console.error("Error removing mentor:", error);
      const message =
        error instanceof Error ? error.message : "Failed to remove mentor.";
      setErrorMessage(message);
      setIsErrorAlertOpen(true);
    } finally {
      setLoading(false);
    }
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
            Mentor (Study Partners) Management
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
              placeholder="Search for mentor"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <div
        className={`h-[88%] w-full flex flex-col bg-white rounded-3xl overflow-hidden ${worksans.className}`}
      >
        {view === "list" && (
          <div className="h-[14%] w-full flex-shrink-0 px-5 py-4">
            <div className="h-full w-full flex justify-between items-center">
              <div
                className={`text-[#1E4640] ${worksans.className} font-semibold text-2xl`}
              >
                Total Mentor({mentorList.length})
              </div>

              <div className="relative h-[50px] flex gap-4">
                <div className="shadow-[0px_0px_4px_0px_#1E464040] hover:shadow-[0px_2px_8px_0px_#1E464060] px-4 gap-2 cursor-pointer rounded-xl items-center justify-center flex bg-white transition-all duration-300 hover:-translate-y-0.2">
                  <Image
                    src="/images/plus.svg"
                    width={20}
                    height={20}
                    alt="plus"
                  />
                  <button
                    className="text-[#1E4640] font-medium"
                    onClick={() => {
                      setSelectedMentor(null);
                      setView("add");
                    }}
                  >
                    Add Mentor
                  </button>
                </div>
                
                {!isReordering ? (
                  <div className="shadow-[0px_0px_4px_0px_#1E464040] hover:shadow-[0px_2px_8px_0px_#1E464060] px-4 gap-2 cursor-pointer rounded-xl items-center justify-center flex bg-white transition-all duration-300 hover:-translate-y-0.2">
                    <DragOutlined className="text-[#1E4640]" />
                    <button
                      className="text-[#1E4640] font-medium"
                      onClick={handleReorderClick}
                    >
                      Reorder
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="shadow-[0px_0px_4px_0px_#1E464040] hover:shadow-[0px_2px_8px_0px_#1E464060] px-4 gap-2 cursor-pointer rounded-xl items-center justify-center flex bg-[#1E4640] transition-all duration-300 hover:-translate-y-0.2">
                      <SaveOutlined className="text-white" />
                      <button
                        className="text-white font-medium cursor-pointer"
                        onClick={handleSaveOrder}
                        disabled={!hasChanges || loading}
                      >
                        Save Order
                      </button>
                    </div>
                    <div className="shadow-[0px_0px_4px_0px_#1E464040] hover:shadow-[0px_2px_8px_0px_#1E464060] px-4 gap-2 cursor-pointer rounded-xl items-center justify-center flex bg-white transition-all duration-300 hover:-translate-y-0.2">
                      <button
                        className="text-[#1E4640] font-medium"
                        onClick={handleCancelReorder}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === "list" ? (
          <DndProvider backend={HTML5Backend}>
            <div className="h-full flex-1 w-full flex bg-white px-4 pb-4">
              <div className="w-full max-h-[500px] overflow-y-auto p-2 no-scrollbar">
                <div className="grid grid-cols-4 gap-4 w-full">
                  {mentorList.length === 0 ? (
                    <div className="col-span-4 flex flex-col items-center justify-center h-full">
                      <Image
                        src="/images/no_content.svg"
                        width={120}
                        height={120}
                        alt="No content available"
                        priority
                      />

                      <div className="text-[#1E4640] font-bold text-2xl text-center mt-4">
                        No Mentors Found!
                      </div>

                      <div className="text-[#758382] text-center mt-1 whitespace-nowrap">
                        Add a mentor to get started.
                      </div>
                    </div>
                  ) : (
                    (isReordering ? reorderedMentors : mentorList).map((mentor, index) => (
                      <DraggableMentorCard
                        key={mentor.id || index}
                        mentor={mentor}
                        index={index}
                        moveMentor={moveMentor}
                        isReordering={isReordering}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </DndProvider>
        ) : (
          <AddMentor
            initialValues={selectedMentor}
            onCancel={() => {
              setView("list");
              setSelectedMentor(null);
            }}
            onSave={handleAddMentor}
            loading={loading}
          />
        )}
      </div>
      <RemoveMentorModal
        visible={isRemoveModalOpen}
        onCancel={() => setIsRemoveModalOpen(false)}
        onRemove={handleConfirmDelete}
        loading={loading}
      />
    </div>
  );
};

export default manageMentor;
