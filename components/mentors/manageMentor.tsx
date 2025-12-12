"use client";

import Image from "next/image";
import { Work_Sans } from "next/font/google";
import { Dropdown, Space, Button, Pagination } from "antd";
import { DownOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState, type SyntheticEvent } from "react";

import { debounce } from "lodash";

import MentorCard from "./MentorCard";
import AddMentor from "./AddMentor";
import RemoveMentorModal from "./RemoveMentorModal";
import {
  addMentor,
  getMentors,
  updateMentor,
  deleteMentor,
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
        description: values.description,
        rank: values.rank,
        speciality: values.speciality,
        expertise: values.expertise,
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
      rank: "Senior Mentor",
      description: "Experienced mentor with 10+ years in counseling.",
      speciality: "Career Guidance",
      expertise: "Psychology",
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
                    onClick={() => {
                      setSelectedMentor(null);
                      setView("add");
                    }}
                  >
                    Add Mentor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "list" ? (
          <div className="h-full flex-1 w-full flex bg-white px-4 pb-4">
            <div className="w-full max-h-[500px] overflow-y-auto p-2 no-scrollbar">
              <div className="grid grid-cols-4 gap-4 w-full">
                {mentorList.length === 0 ? (
                  <div className="col-span-4 flex flex-col items-center justify-center w-full h-full min-h-[500px]">
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
                  mentorList.map((mentor, index) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
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
