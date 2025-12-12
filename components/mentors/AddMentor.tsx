import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Input, Button, Form, Row, Col } from "antd";
import { Work_Sans } from "next/font/google"; // Leave this as is
import { DeleteOutlined } from "@ant-design/icons";
import styles from "./AddMentor.module.css";
import AddSessionCardModal from "./AddSessionCardModal";
import SetScheduleModal from "./SetScheduleModal";

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

interface SessionCardData {
  duration: number;
  fees: string;
}

interface AddMentorProps {
  onCancel: () => void;
  onSave?: (data: any) => void;
  initialValues?: any;
  loading?: boolean;
}

const AddMentor: React.FC<AddMentorProps> = ({ onCancel, onSave, initialValues, loading }) => {
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [sessionCards, setSessionCards] = useState<SessionCardData[]>([]);
  const [scheduleData, setScheduleData] = useState<any[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      if (initialValues.image) setPreview(initialValues.image);
      if (initialValues.sessionCards) setSessionCards(initialValues.sessionCards);
      if (initialValues.schedule) setScheduleData(initialValues.schedule);
    } else {
      form.resetFields();
      setPreview(null);
      setImageFile(null);
      setSessionCards([]);
      setScheduleData([]);
    }
  }, [initialValues, form]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleSubmit = () => {
    console.log("Submit clicked");
    form
      .validateFields()
      .then((values) => {
        console.log("Validation successful", values);
        console.log("Passing image:", initialValues?.image);
        console.log("Passing imageFile:", imageFile);

        // Pass initialValues.image to ensure it's preserved if not changed
        onSave?.({
          ...values,
          image: initialValues?.image,
          imageFile,
          sessionCards,
          schedule: scheduleData
        });
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };

  const handleAddSessionCard = (data: SessionCardData) => {
    setSessionCards([...sessionCards, data]);
    setIsSessionModalOpen(false);
  };

  const handleRemoveSessionCard = (index: number) => {
    const newCards = [...sessionCards];
    newCards.splice(index, 1);
    setSessionCards(newCards);
  };

  const handleSaveSchedule = (data: any[]) => {
    console.log("Schedule Saved:", data);
    setScheduleData(data);
    setIsScheduleModalOpen(false);
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = minutes / 60;
      return `${hours} ${hours > 1 ? "Hours" : "Hour"}`;
    }
    return `${minutes} Mins`;
  };

  return (
    <div
      className={`w-full h-[640px] flex flex-col bg-white rounded-3xl p-6 ${worksans.className}`}
    >
      {/* Header with Set Schedule */}
      <div className="flex justify-end mb-1.5">
        <Button
          className={`flex items-center gap-2 border border-[#1E4640] text-[#1E4640] rounded-lg px-4 py-2 font-medium ${styles.customButton}`}
          onClick={() => setIsScheduleModalOpen(true)}
        >
          Set Schedule
          <Image
            src="/images/Calendar.svg"
            alt="calendar"
            width={16}
            height={18}
          />
        </Button>
      </div>

      <div className="flex gap-8 flex-1 overflow-y-auto no-scrollbar">
        {/* Left Side - Image Upload */}
        <div className="w-[200px] flex flex-col items-center">
          <div className="relative w-[160px] h-[160px]">
            {/* Circle Wrapper */}
            <div className="w-[162px] h-[162px] rounded-full overflow-hidden bg-gradient-to-tr from-cyan-100 to-pink-100 shadow-lg relative">
              <Image
                src={preview || "/images/dummy-mentor.png"}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>

            {/* Camera Icon */}
            <div
              onClick={handleImageClick}
              className="absolute bottom-1 right-1 bg-[#1E4640] rounded-full p-2 cursor-pointer shadow-md border-2 border-white flex items-center justify-center"
            >
              <Image
                src="/images/Camera.svg"
                alt="camera"
                width={20}
                height={20}
              />
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Right Side - Form Fields */}
        <div className="flex-1 flex flex-col gap-5 max-w-3xl">
          <Form form={form} layout="vertical" className="w-full">
            {/* Name and Rank Row */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label={
                    <span className="text-[#1E4640] font-bold text-base">
                      Name
                    </span>
                  }
                  rules={[{ required: true, message: "Add mentor's full name" }]}
                >
                  <Input
                    placeholder="Add mentor's full name"
                    className={`p-3 rounded-xl border border-gray-200 ${styles.customInput}`}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="rank"
                  label={
                    <span className="text-[#1E4640] font-bold text-base">
                      Rank
                    </span>
                  }
                  rules={[{ required: true, message: "Enter position or level" }]}
                >
                  <Input
                    placeholder="Enter position or level"
                    className={`p-3 rounded-xl border border-gray-200 ${styles.customInput}`}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Short Bio */}
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label={
                    <span className="text-[#1E4640] font-bold text-base">
                      Short Bio
                    </span>
                  }
                  rules={[{ required: true, message: "Add short bio" }]}
                >
                  <Input
                    placeholder="Add short bio"
                    className={`p-3 rounded-xl border border-gray-200 ${styles.customInput}`}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Speciality and Expertise Row */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="speciality"
                  label={
                    <span className="text-[#1E4640] font-bold text-base">
                      Speciality
                    </span>
                  }
                  rules={[{ required: true, message: "Enter Speciality" }]}
                >
                  <Input
                    placeholder="Enter Speciality"
                    className={`p-3 rounded-xl border border-gray-200 ${styles.customInput}`}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expertise"
                  label={
                    <span className="text-[#1E4640] font-bold text-base">
                      Expertise
                    </span>
                  }
                  rules={[{ required: true, message: "Enter Expertise" }]}
                >
                  <Input
                    placeholder="Enter Expertise"
                    className={`p-3 rounded-xl border border-gray-200 ${styles.customInput}`}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Email ID */}
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  name="emailId"
                  label={
                    <span className="text-[#1E4640] font-bold text-base">
                      Email ID
                    </span>
                  }
                  rules={[
                    { required: true, message: "Enter Email ID" },
                    { type: "email", message: "Enter a valid email" },
                  ]}
                >
                  <Input
                    placeholder="Enter Email ID"
                    className={`p-3 rounded-xl border border-gray-200 ${styles.customInput} text-[#0066CC]`}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Session Card */}
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[#1E4640] font-bold text-base">
                      Session Card
                    </label>
                    <Button
                      type="primary"
                      className={`bg-[#1E4640] text-white text-xs px-3 py-1 rounded-md ${styles.customPrimaryButton}`}
                      onClick={() => setIsSessionModalOpen(true)}
                    >
                      Add
                    </Button>
                  </div>

                  {/* List of Session Cards */}
                  <div className="flex flex-col gap-3">
                    {sessionCards.map((card, index) => (
                      <div
                        key={index}
                        className="w-full p-3 border border-gray-200 rounded-xl flex items-center justify-between"
                      >
                        <span className="text-[#1E4640] font-medium text-base">
                          {formatDuration(card.duration)} : ₹{card.fees}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-50"
                          onClick={() => handleRemoveSessionCard(index)}
                        >
                          <DeleteOutlined className="text-red-500 text-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-4 mb-4">
              <Button
                onClick={onCancel}
                className={`px-8 py-5 rounded-lg border border-[#1E4640] text-[#1E4640] font-semibold ${styles.customButton}`}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                className={`px-8 py-5 rounded-lg bg-[#1E4640] text-white font-semibold ${styles.customPrimaryButton}`}
                onClick={handleSubmit}
                loading={loading}
              >
                {initialValues ? "Update" : "Save"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
      <AddSessionCardModal
        open={isSessionModalOpen}
        onCancel={() => setIsSessionModalOpen(false)}
        onSave={handleAddSessionCard}
      />
      <SetScheduleModal
        open={isScheduleModalOpen}
        onCancel={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
      />
    </div>
  );
};

export default AddMentor;
