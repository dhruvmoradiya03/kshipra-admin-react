"use client";

import Image from "next/image";
import { Work_Sans } from "next/font/google";
import { useState } from "react";
import BookingsList, { Booking } from "./BookingsList"; // Import new list
import "./bookings.css"; // Assuming we might want to keep or rename flashcard.css references if needed, but for now I'll trust bookings.css exists or use inline styles. 
// Note: The previous file imported "./flashcard.css", but the directory listing showed "bookings.css". 

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"], subsets: ["latin"] });

const dummyBookings: Booking[] = [
  {
    id: "1",
    studentName: "John Doe",
    mentorName: "Alice Smith",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹500",
    bookingStatus: "Accepted",
    paymentStatus: "Paid",
  },
  {
    id: "2",
    studentName: "Jane Roe",
    mentorName: "Bob Johnson",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹500",
    bookingStatus: "Accepted",
    paymentStatus: "Pending",
  },
  {
    id: "3",
    studentName: "Michael Scott",
    mentorName: "Dwight Schrute",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹1000",
    bookingStatus: "Accepted",
    paymentStatus: "Paid",
  },
  {
    id: "4",
    studentName: "Jim Halpert",
    mentorName: "Pam Beesly",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹750",
    bookingStatus: "Accepted",
    paymentStatus: "Refund",
  },
  {
    id: "5",
    studentName: "Ryan Howard",
    mentorName: "Kelly Kapoor",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹600",
    bookingStatus: "Rejected",
    paymentStatus: "Pending",
  },
  {
    id: "6",
    studentName: "Stanley Hudson",
    mentorName: "Phyllis Vance",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹550",
    bookingStatus: "Rejected",
    paymentStatus: "Paid",
  },
  {
    id: "7",
    studentName: "Angela Martin",
    mentorName: "Oscar Martinez",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹800",
    bookingStatus: "Accepted",
    paymentStatus: "Pending",
  },
  {
    id: "8",
    studentName: "Angela Martin",
    mentorName: "Oscar Martinez",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹800",
    bookingStatus: "Rejected",
    paymentStatus: "Paid",
  },
  {
    id: "9",
    studentName: "Angela Martin",
    mentorName: "Oscar Martinez",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹800",
    bookingStatus: "Rejected",
    paymentStatus: "Refund",
  },
  {
    id: "10",
    studentName: "Angela Martin",
    mentorName: "Oscar Martinez",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹800",
    bookingStatus: "Accepted",
    paymentStatus: "Pending",
  },
  {
    id: "11",
    studentName: "Angela Martin",
    mentorName: "Oscar Martinez",
    timeSlot: "17.06.25 11:00AM",
    duration: "1 hour",
    amount: "₹800",
    bookingStatus: "Accepted",
    paymentStatus: "Paid",
  },
];

const ManageBookings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter dummy data based on search
  const filteredBookings = dummyBookings.filter(b =>
    b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.mentorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const currentData = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className={`flex flex-col px-6 py-4 bg-[#F5F6F7] h-full ${worksans.className}`}>
      {/* Header Section */}
      <div className="h-[12%] w-full items-center justify-center flex ">
        <div className="flex justify-between w-full items-center">
          <div className={`text-[#1E4640] ${worksans.className} font-semibold text-2xl`}>
            Booking List
          </div>
          <div className="relative rounded-xl shadow-[0px_0px_4px_0px_#1E464040]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Image src="/images/search.svg" width={16} height={16} alt="search" />
            </div>
            <input
              type="text"
              className="pl-12 p-3 rounded-xl w-[350px] text-black border-none "
              placeholder="Search For Bookings"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Box */}
      <div className={`h-[88%] w-full flex flex-col bg-white rounded-3xl overflow-hidden ${worksans.className}`}>
        {/* Total Bookings Count Area */}
        <div className="w-full flex-shrink-0 px-6 py-5 mt-3">
          <div
            className={`text-[#1E4640] ${worksans.className} font-semibold text-2xl`}
          >
            Total Bookings({filteredBookings.length})
          </div>
        </div>

        {/* Bookings List Table or No Content */}
        <div className="h-full flex-1 w-full flex bg-white px-4 pt-4 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <Image
                src="/images/no_content.svg"
                width={120}
                height={120}
                alt="No content available"
                priority
              />
              <div className="text-[#1E4640] font-bold text-2xl text-center mt-4">
                No Bookings Found!
              </div>
              <div className="text-[#758382] text-center mt-1 whitespace-nowrap">
                No bookings available.
              </div>
            </div>
          ) : (
            <BookingsList
              bookings={currentData}
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: filteredBookings.length
              }}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
