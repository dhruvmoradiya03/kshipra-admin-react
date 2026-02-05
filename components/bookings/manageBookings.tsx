"use client";

import Image from "next/image";
import { Work_Sans } from "next/font/google";
import { useState, useEffect } from "react";
import BookingsList, { Booking } from "./BookingsList"; // Import new list
import "./bookings.css"; // Assuming we might want to keep or rename flashcard.css references if needed, but for now I'll trust bookings.css exists or use inline styles. 
// Note: The previous file imported "./flashcard.css", but the directory listing showed "bookings.css". 

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"], subsets: ["latin"] });

import { getBookings } from "../../service/api/bookings.api";
import Loader from "../loader";

const ManageBookings = () => {
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null);
  const [lastVisibleDocs, setLastVisibleDocs] = useState<Record<number, any | null>>({});

  useEffect(() => {
    let mounted = true;
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const lastVisible = currentPage === 1 ? null : lastVisibleDocs[currentPage - 1];
        const res: any = await getBookings(currentPage, pageSize, lastVisible);
        if (mounted && res?.data) {
          setBookingsData(res.data);
          setTotalBookings(res.total);
          if (res.lastVisible) {
            setLastVisibleDoc(res.lastVisible);
            setLastVisibleDocs(prev => ({ ...prev, [currentPage]: res.lastVisible }));
          }
        }
      } catch (e) {
        console.error("Failed to load bookings", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBookings();
    return () => {
      mounted = false;
    };
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
      setLastVisibleDocs({});
    } else {
      setCurrentPage(page);
    }
  };

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
            Total Bookings({totalBookings})
          </div>
        </div>

        {/* Bookings List Table or No Content */}
        <div className="h-full flex-1 w-full flex bg-white px-4 pt-4 overflow-hidden">
          {bookingsData.length === 0 && !loading ? (
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
              bookings={bookingsData}
              loading={loading}
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: totalBookings
              }}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
