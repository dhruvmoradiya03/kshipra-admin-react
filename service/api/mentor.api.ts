import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  getDoc,
  serverTimestamp,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../config/firebase.config";
import { Session } from "inspector/promises";

export interface SessionCard {
  duration: string;
  fees: number;
  requiredSlots: number;
  currency: string;
}

export interface Schedule {
  day: string;
  timeSlots: string[];
}

export interface Mentor {
  id?: string;
  name: string;
  image: string;
  emailId: string;
  shortBio: string;
  rank: string[];
  speciality: string;
  expertise: string[];
  sessionCard: SessionCard[];
  schedule: Schedule[];
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export const addMentor = async (mentorData: any) => {
  try {

    // Check for unique email
    const mentorsRef = collection(db, "mentors");
    const q = query(
      mentorsRef,
      where("emailId", "==", mentorData.emailId),
      where("isActive", "==", true)
    );
    const existingMentors = await getDocs(q);

    if (!existingMentors.empty) {
      throw new Error("A mentor with this email ID already exists.");
    }

    // Step 1: Create the document
    const docRef = await addDoc(collection(db, "mentors"), {
      name: mentorData.name,
      image: mentorData.image,
      emailId: mentorData.emailId,
      shortBio: mentorData.shortBio,
      rank: mentorData.rank,
      speciality: mentorData.speciality,
      expertise: mentorData.expertise,
      sessionCard: mentorData.sessionCard,
      schedule: mentorData.schedule || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Step 2: Immediately update the new document with document_id
    await updateDoc(docRef, {
      document_id: docRef.id,
    });

    return {
      id: docRef.id,
      name: mentorData.name,
      image: mentorData.image,
      emailId: mentorData.emailId,
      shortBio: mentorData.shortBio,
      rank: mentorData.rank,
      speciality: mentorData.speciality,
      expertise: mentorData.expertise,
      sessionCard: mentorData.sessionCard,
      schedule: mentorData.schedule,
      document_id: docRef.id,
      createdAt: new Date().toISOString,
      updatedAt: new Date().toISOString,
    };
  } catch (error) {
    console.error("Error adding mentor:", error);
    throw new Error("Failed to add mentor");
  }
};

export const getMentors = async (searchQuery: string = "") => {
  try {
    const mentorsRef = collection(db, "mentors");
    let q;

    if (searchQuery && searchQuery.trim() !== "") {
      q = query(
        mentorsRef,
        where("isActive", "==", true),
        where("name", ">=", searchQuery),
        where("name", "<=", searchQuery + "\uf8ff"),
        orderBy("name") // Firestore requires the field in range filter to be the first orderBy
      );
    } else {
      q = query(
        mentorsRef,
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const mentors = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Mentor[];

    return {
      data: mentors,
    };
  } catch (error) {
    console.error("Error fetching mentors:", error);
    throw new Error("Failed to fetch mentors");
  }
};

export const updateMentor = async (mentorId: string, updateData: any) => {
  try {
    const noteRef = doc(db, "mentors", mentorId);

    console.log(updateData, "this is update data");
    await updateDoc(noteRef, {
      name: updateData.name,
      image: updateData.image,
      emailId: updateData.emailId,
      shortBio: updateData.shortBio,
      rank: updateData.rank,
      speciality: updateData.speciality,
      expertise: updateData.expertise,
      sessionCard: updateData.sessionCard,
      schedule: updateData.schedule,
      updatedAt: new Date().toISOString(),
    });
    return { id: mentorId, ...updateData };
  } catch (error) {
    console.error("Error updating mentor:", error);
    throw new Error("Failed to update mentor");
  }
};

// Soft delete a note
export const deleteMentor = async (mentorId: string) => {
  try {
    const noteRef = doc(db, "mentors", mentorId);
    await updateDoc(noteRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting mentor:", error);
    throw new Error("Failed to delete mentor");
  }
};
