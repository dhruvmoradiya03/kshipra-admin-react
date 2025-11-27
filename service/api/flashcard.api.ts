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

export interface Flashcard {
  id?: string;
  subjectId: string;
  topicId: string;
  noteId: string;
  question: string;
  answer: string;
  category: string;
  isDeleted: boolean;
  createdAt: any;
  updatedAt: any;
  document_id?: string;
}

// Add a new flashcard
export const addFlashcard = async (
  flashcardData: Omit<
    Flashcard,
    "id" | "isDeleted" | "createdAt" | "updatedAt" | "document_id"
  >
) => {
  try {
    const timestamp = serverTimestamp();

    // Step 1: Create the document
    const docRef = await addDoc(collection(db, "flashcards"), {
      subjectId: flashcardData.subjectId,
      topicId: flashcardData.topicId,
      noteId: flashcardData.noteId,
      question: flashcardData.question,
      answer: flashcardData.answer,
      category: flashcardData.category,
      isDeleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Step 2: Immediately update the new document with document_id
    await updateDoc(docRef, {
      document_id: docRef.id,
    });

    return {
      id: docRef.id,
      ...flashcardData,
      document_id: docRef.id,
      isDeleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  } catch (error) {
    console.error("Error adding flashcard:", error);
    throw new Error("Failed to add flashcard");
  }
};

// Update a flashcard
export const updateFlashcard = async (
  flashcardId: string,
  updateData: Partial<
    Omit<Flashcard, "id" | "createdAt" | "updatedAt" | "document_id">
  >
) => {
  try {
    const flashcardRef = doc(db, "flashcards", flashcardId);

    await updateDoc(flashcardRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    return { id: flashcardId, ...updateData };
  } catch (error) {
    console.error("Error updating flashcard:", error);
    throw new Error("Failed to update flashcard");
  }
};

// Soft delete a flashcard
export const deleteFlashcard = async (flashcardId: string) => {
  try {
    const flashcardRef = doc(db, "flashcards", flashcardId);
    await updateDoc(flashcardRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    throw new Error("Failed to delete flashcard");
  }
};

// Get flashcards with pagination
export const getFlashcards = async (
  page: number = 1,
  pageSize: number = 10,
  lastVisible: any = null
) => {
  try {
    const flashcardsRef = collection(db, "flashcards");
    let q = query(
      flashcardsRef,
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastVisible) {
      q = query(
        flashcardsRef,
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const flashcards = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Flashcard[];

    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === pageSize;

    return {
      data: flashcards,
      lastVisible: lastVisibleDoc,
      hasMore,
      total: flashcards.length,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw new Error("Failed to fetch flashcards");
  }
};

// Get a single flashcard by ID
export const getFlashcardById = async (flashcardId: string) => {
  try {
    const flashcardRef = doc(db, "flashcards", flashcardId);
    const flashcardSnap = await getDoc(flashcardRef);

    if (flashcardSnap.exists()) {
      return { id: flashcardSnap.id, ...flashcardSnap.data() } as Flashcard;
    } else {
      throw new Error("Flashcard not found");
    }
  } catch (error) {
    console.error("Error getting flashcard:", error);
    throw new Error("Failed to get flashcard");
  }
};

// Get flashcards by subject ID
export const getFlashcardsBySubjectId = async (
  subjectId: string,
  page: number = 1,
  pageSize: number = 10,
  lastVisible: any = null
) => {
  try {
    const flashcardsRef = collection(db, "flashcards");

    // Get total matching documents
    const countQuery = query(
      flashcardsRef,
      where("subjectId", "==", subjectId),
      where("isDeleted", "==", false)
    );
    const totalSnap = await getCountFromServer(countQuery);
    const total = totalSnap.data().count;

    // Main paginated query
    let q = query(
      flashcardsRef,
      where("subjectId", "==", subjectId),
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    // If we have a cursor, apply it
    if (lastVisible && page !== 1) {
      q = query(
        flashcardsRef,
        where("subjectId", "==", subjectId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const flashcards = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Flashcard[];

    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      data: flashcards,
      lastVisible: newLastVisible,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Error fetching flashcards by subject ID:", error);
    throw new Error("Failed to fetch flashcards by subject ID");
  }
};

// Get flashcards by topic ID
export const getFlashcardsByTopicId = async (
  topicId: string,
  page: number = 1,
  pageSize: number = 10,
  lastVisible: any = null
) => {
  try {
    const flashcardsRef = collection(db, "flashcards");

    // Get total matching documents
    const countQuery = query(
      flashcardsRef,
      where("topicId", "==", topicId),
      where("isDeleted", "==", false)
    );
    const totalSnap = await getCountFromServer(countQuery);
    const total = totalSnap.data().count;

    // Main paginated query
    let q = query(
      flashcardsRef,
      where("topicId", "==", topicId),
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    // If we have a cursor, apply it
    if (lastVisible && page !== 1) {
      q = query(
        flashcardsRef,
        where("topicId", "==", topicId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const flashcards = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Flashcard[];

    const newLastVisible =
      querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return {
      data: flashcards,
      lastVisible: newLastVisible,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Error fetching flashcards by topic ID:", error);
    throw new Error("Failed to fetch flashcards by topic ID");
  }
};
