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

const updateTopicNotesPdfUrl = async (topicId: string, fileUrl: unknown) => {
  if (typeof topicId !== "string" || !topicId.trim()) {
    return;
  }

  if (typeof fileUrl !== "string" || !fileUrl.trim()) {
    return;
  }

  const topicRef = doc(db, "topics", topicId);
  await updateDoc(topicRef, {
    notes_pdf_url: fileUrl,
    updatedAt: serverTimestamp(),
  });
};

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

    await updateTopicNotesPdfUrl(noteData.topicId, noteData.file);

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

    await updateTopicNotesPdfUrl(updateData.topicId, updateData.file);
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
  lastVisibleDocs: Record<number, any | null> = {},
  searchQuery: string = ""
) => {
  try {
    const notesRef = collection(db, "notes");

    if (searchQuery && searchQuery.trim() !== "") {
      const countQuery = query(
        notesRef,
        where("subjectId", "==", subjectId),
        where("isDeleted", "==", false),
        where("title", ">=", searchQuery),
        where("title", "<=", searchQuery + "\uf8ff")
      );
      const totalSnap = await getCountFromServer(countQuery);
      const total = totalSnap.data().count;

      let q;

      if (page === 1 || !lastVisibleDocs[page - 1]) {
        console.log("this is if");
        q = query(
          notesRef,
          where("subjectId", "==", subjectId),
          where("title", ">=", searchQuery),
          where("title", "<=", searchQuery + "\uf8ff"),
          where("isDeleted", "==", false),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
        console.log(q, "this is q");
      } else {
        console.log("this is else");
        q = query(
          notesRef,
          where("subjectId", "==", subjectId),
          where("title", ">=", searchQuery),
          where("title", "<=", searchQuery + "\uf8ff"),
          where("isDeleted", "==", false),
          orderBy("createdAt", "desc"),
          startAfter(lastVisibleDocs[page - 1]),
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

      console.log(notes, "this is notes");
      return {
        data: notes,
        lastVisible: lastVisibleDoc,
        total,
        page,
        pageSize,
      };
    }

    const countQuery = query(
      notesRef,
      where("subjectId", "==", subjectId),
      where("isDeleted", "==", false)
    );
    const totalSnap = await getCountFromServer(countQuery);
    const total = totalSnap.data().count;

    let q;
    if (page === 1 || !lastVisibleDocs[page - 1]) {
      q = query(
        notesRef,
        where("subjectId", "==", subjectId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      q = query(
        notesRef,
        where("subjectId", "==", subjectId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisibleDocs[page - 1]),
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

    return {
      data: notes,
      lastVisible: lastVisibleDoc,
      total,
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
  lastVisibleDocs: Record<number, any | null> = {},
  searchQuery: string = ""
) => {
  try {
    const notesRef = collection(db, "notes");

    console.log(searchQuery, "this is search query");
    if (searchQuery && searchQuery.trim() !== "") {
      const countQuery = query(
        notesRef,
        where("topicId", "==", topicId),
        where("isDeleted", "==", false),
        where("title", ">=", searchQuery),
        where("title", "<=", searchQuery + "\uf8ff")
      );
      const totalSnap = await getCountFromServer(countQuery);
      const total = totalSnap.data().count;

      let q;

      if (page === 1 || !lastVisibleDocs[page - 1]) {
        q = query(
          notesRef,
          where("topicId", "==", topicId),
          where("title", ">=", searchQuery),
          where("title", "<=", searchQuery + "\uf8ff"),
          where("isDeleted", "==", false),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      } else {
        q = query(
          notesRef,
          where("topicId", "==", topicId),
          where("title", ">=", searchQuery),
          where("title", "<=", searchQuery + "\uf8ff"),
          where("isDeleted", "==", false),
          orderBy("createdAt", "desc"),
          startAfter(lastVisibleDocs[page - 1]),
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

      return {
        data: notes,
        lastVisible: lastVisibleDoc,
        total,
        page,
        pageSize,
      };
    }

    const countQuery = query(
      notesRef,
      where("topicId", "==", topicId),
      where("isDeleted", "==", false)
    );

    const totalSnap = await getCountFromServer(countQuery);
    const total = totalSnap.data().count;

    let q;
    if (page === 1 || !lastVisibleDocs[page - 1]) {
      q = query(
        notesRef,
        where("topicId", "==", topicId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      q = query(
        notesRef,
        where("topicId", "==", topicId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisibleDocs[page - 1]),
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

    return {
      data: notes,
      lastVisible: lastVisibleDoc,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Error fetching notes by topic:", error);
    throw new Error("Failed to fetch notes by topic");
  }
};
