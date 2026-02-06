import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
  getDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase.config";

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
  order: number;
  createdAt: any;
  updatedAt: any;
}

export interface MentorSession {
    id?: string;
    mentor_id: string;
    user_id: string[];
    is_free: boolean;
    name: string;
    description: string;
    meeting_link: string;
    video_url?: string;
    banner_url?: string;
    date: string;
    time: string;
    duration?: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

export const addSession = async (sessionData: MentorSession) => {
  try {
    // Create the document in live_sessions collection
    const docRef = await addDoc(collection(db, "live_sessions"), {
      mentor_id: sessionData.mentor_id,
      user_id: sessionData.user_id || [],
      is_free: sessionData.is_free,
      name: sessionData.name,
      description: sessionData.description,
      meeting_link: sessionData.meeting_link,
      video_url: sessionData.video_url || "",
      banner_url: sessionData.banner_url || "",
      date: sessionData.date,
      time: sessionData.time,
      duration: sessionData.duration || "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Return the created session data
    return {
      id: docRef.id,
      mentor_id: sessionData.mentor_id,
      user_id: sessionData.user_id || [],
      is_free: sessionData.is_free,
      name: sessionData.name,
      description: sessionData.description,
      meeting_link: sessionData.meeting_link,
      video_url: sessionData.video_url || "",
      banner_url: sessionData.banner_url || "",
      date: sessionData.date,
      time: sessionData.time,
      duration: sessionData.duration || "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error adding session:", error);
    throw new Error("Failed to add session");
  }
};

export const getSessions = async (searchQuery: string = "") => {
  try {
    const sessionsRef = collection(db, "live_sessions");
    let q;

    if (searchQuery && searchQuery.trim() !== "") {
      q = query(
        sessionsRef,
        where("isActive", "==", true),
        where("name", ">=", searchQuery),
        where("name", "<=", searchQuery + "\uf8ff"),
        orderBy("name")
      );
    } else {
      q = query(
        sessionsRef,
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MentorSession[];

    return {
      data: sessions,
    };
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw new Error("Failed to fetch sessions");
  }
};

export const updateSession = async (sessionId: string, updateData: any) => {
  try {
    const sessionRef = doc(db, "live_sessions", sessionId);

    await updateDoc(sessionRef, {
      mentor_id: updateData.mentor_id,
      user_id: updateData.user_id,
      is_free: updateData.is_free,
      name: updateData.name,
      description: updateData.description,
      meeting_link: updateData.meeting_link,
      video_url: updateData.video_url,
      banner_url: updateData.banner_url,
      date: updateData.date,
      time: updateData.time,
      duration: updateData.duration,
      updatedAt: new Date().toISOString(),
    });
    return { id: sessionId, ...updateData };
  } catch (error) {
    console.error("Error updating session:", error);
    throw new Error("Failed to update session");
  }
};

export const deleteSession = async (sessionId: string) => {
  try {
    const sessionRef = doc(db, "live_sessions", sessionId);
    await updateDoc(sessionRef, {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    throw new Error("Failed to delete session");
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
        orderBy("order", "asc") // Order by order field instead of createdAt
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

// Soft delete a note and reorder remaining mentors
export const deleteMentor = async (mentorId: string) => {
  try {
    // Get the mentor being deleted to know its order
    const mentorRef = doc(db, "mentors", mentorId);
    const mentorDoc = await getDoc(mentorRef);
    
    if (!mentorDoc.exists()) {
      throw new Error("Mentor not found");
    }
    
    const deletedMentor = mentorDoc.data();
    const deletedOrder = deletedMentor.order;
    
    // Step 1: Soft delete the mentor
    await updateDoc(mentorRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
    
    // Step 2: Get all active mentors with order > deletedOrder
    const mentorsRef = collection(db, "mentors");
    const q = query(
      mentorsRef,
      where("isActive", "==", true),
      where("order", ">", deletedOrder),
      orderBy("order", "asc")
    );
    const querySnapshot = await getDocs(q);
    
    // Step 3: Update all mentors with order > deletedOrder to decrement their order by 1
    const updatePromises = querySnapshot.docs.map((doc) => {
      const mentorRef = doc.ref;
      const currentOrder = doc.data().order;
      return updateDoc(mentorRef, {
        order: currentOrder - 1,
        updatedAt: new Date().toISOString(),
      });
    });
    
    await Promise.all(updatePromises);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting mentor:", error);
    throw new Error("Failed to delete mentor");
  }
};

// Update mentor order
export const updateMentorOrder = async (mentorId: string, order: number) => {
  try {
    const mentorRef = doc(db, "mentors", mentorId);
    await updateDoc(mentorRef, {
      order: order,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating mentor order:", error);
    throw new Error("Failed to update mentor order");
  }
};

// Bulk update mentor orders
export const updateMentorOrders = async (mentorOrders: { mentorId: string; order: number }[]) => {
  try {
    const batch = mentorOrders.map(({ mentorId, order }) => {
      const mentorRef = doc(db, "mentors", mentorId);
      return updateDoc(mentorRef, {
        order: order,
        updatedAt: new Date().toISOString(),
      });
    });
    
    await Promise.all(batch);
    return { success: true };
  } catch (error) {
    console.error("Error updating mentor orders:", error);
    throw new Error("Failed to update mentor orders");
  }
};