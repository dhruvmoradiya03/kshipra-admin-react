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

export interface Note {
  id?: string;
  subjectId: string;
  topicId: string;
  title: string;
  file: string;
  isDeleted: boolean;
  createdAt: any;
  updatedAt: any;
}

// Add a new note
export const addNote = async (noteData: any) => {
  try {
    const timestamp = serverTimestamp();

    // Step 1: Create the document
    const docRef = await addDoc(collection(db, "notes"), {
      subjectId: noteData.subjectId,
      topicId: noteData.topicId,
      title: noteData.title,
      file: noteData.file,
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
      subjectId: noteData.subjectId,
      topicId: noteData.topicId,
      title: noteData.title,
      file: noteData.file,
      document_id: docRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  } catch (error) {
    console.error("Error adding note:", error);
    throw new Error("Failed to add note");
  }
};

// Update a note
export const updateNote = async (noteId: string, updateData: any) => {
  try {
    const noteRef = doc(db, "notes", noteId);

    console.log(updateData, "this is update data");
    await updateDoc(noteRef, {
      subjectId: updateData.subjectId,
      topicId: updateData.topicId,
      title: updateData.title,
      file: updateData.file,
      updatedAt: serverTimestamp(),
    });
    return { id: noteId, ...updateData };
  } catch (error) {
    console.error("Error updating note:", error);
    throw new Error("Failed to update note");
  }
};

// Soft delete a note
export const deleteNote = async (noteId: string) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting note:", error);
    throw new Error("Failed to delete note");
  }
};

// Get notes with pagination
export const getNotes = async (
  page: number = 1,
  pageSize: number = 10,
  lastVisible: any = null
) => {
  try {
    const notesRef = collection(db, "notes");
    let q = query(
      notesRef,
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastVisible) {
      q = query(
        notesRef,
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const notes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];

    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === pageSize;

    return {
      data: notes,
      lastVisible: lastVisibleDoc,
      hasMore,
      total: notes.length,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw new Error("Failed to fetch notes");
  }
};

// Get a single note by ID
export const getNoteById = async (noteId: string) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    const noteSnap = await getDoc(noteRef);

    if (noteSnap.exists()) {
      return { id: noteSnap.id, ...noteSnap.data() } as Note;
    } else {
      throw new Error("Note not found");
    }
  } catch (error) {
    console.error("Error getting note:", error);
    throw new Error("Failed to get note");
  }
};

// Get notes by subject ID

export const getNotesBySubjectId = async (
  subjectId: string,
  page: number = 1,
  pageSize: number = 10,
  lastVisible: any = null
) => {
  try {
    const notesRef = collection(db, "notes");

    // 🔥 1) Get total matching documents (only once per subject)
    const countQuery = query(
      notesRef,
      where("subjectId", "==", subjectId),
      where("isDeleted", "==", false)
    );
    const totalSnap = await getCountFromServer(countQuery);
    const total = totalSnap.data().count;

    // 🔥 2) Main paginated query
    let q = query(
      notesRef,
      where("subjectId", "==", subjectId),
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    // If we have a cursor, apply it
    if (lastVisible) {
      q = query(
        notesRef,
        where("subjectId", "==", subjectId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);

    const notes = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];

    const lastVisibleDoc =
      querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    const hasMore = page * pageSize < total;

    return {
      data: notes,
      lastVisible: lastVisibleDoc, // snapshot, not plain object
      hasMore,
      total, // total matching docs (correct for pages UI)
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Error fetching notes by subject:", error);
    throw new Error("Failed to fetch notes by subject");
  }
};

// Get notes by topic ID
export const getNotesByTopicId = async (
  topicId: string,
  page: number = 1,
  pageSize: number = 10,
  lastVisible: any = null
) => {
  try {
    const notesRef = collection(db, "notes");

    // 1️⃣ Count total matching documents
    const countQuery = query(
      notesRef,
      where("topicId", "==", topicId),
      where("isDeleted", "==", false)
    );

    const totalSnap = await getCountFromServer(countQuery);
    const total = totalSnap.data().count;

    // 2️⃣ Build main paginated query
    let q = query(
      notesRef,
      where("topicId", "==", topicId),
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    // If we have a cursor (lastVisible), apply it
    if (lastVisible) {
      q = query(
        notesRef,
        where("topicId", "==", topicId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );
    }

    // 3️⃣ Fetch page
    const querySnapshot = await getDocs(q);

    const notes = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];

    // 4️⃣ Get new cursor
    const lastVisibleDoc =
      querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    const hasMore = page * pageSize < total;

    return {
      data: notes,
      lastVisible: lastVisibleDoc, // snapshot
      hasMore,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Error fetching notes by topic:", error);
    throw new Error("Failed to fetch notes by topic");
  }
};
