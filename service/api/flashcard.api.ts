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
import { getStorage, ref, uploadBytes } from "firebase/storage";
import * as XLSX from "xlsx";

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

const normalize = (value: unknown): string => String(value ?? "").trim();
const normalizeKey = (value: unknown): string => normalize(value).toLowerCase();

const REQUIRED_HEADERS = ["note title", "question", "answer", "category"];

interface BulkUploadResult {
  totalCount: number;
  successCount: number;
  skippedCount: number;
  storagePath: string;
}

export const uploadFlashcardsFromExcel = async (
  file: File | Blob,
  options: { subjectId: string; topicId: string }
): Promise<BulkUploadResult> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const { subjectId, topicId } = options;

  if (!subjectId || !topicId) {
    throw new Error("Subject and topic must be selected before uploading.");
  }

  const storage = getStorage();
  const timestamp = Date.now();
  const originalName = (file as File).name ?? "flashcards.xlsx";
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageRef = ref(
    storage,
    `uploads/flashcards/${timestamp}-${sanitizedName}`
  );

  await uploadBytes(storageRef, file);

  const arrayBuffer =
    "arrayBuffer" in file
      ? await (file as File).arrayBuffer()
      : await new Response(file).arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!worksheet) {
    throw new Error("The uploaded Excel file does not contain any worksheets.");
  }

  const rows = XLSX.utils.sheet_to_json<(string | undefined)[]>(worksheet, {
    header: 1,
    blankrows: false,
  });

  if (rows.length === 0) {
    throw new Error("The uploaded Excel sheet is empty.");
  }

  const headerRow =
    (rows[0] as (string | undefined)[] | undefined)?.map(
      (cell: string | undefined) => normalize(cell).toLowerCase()
    ) ?? [];
  const headerValid = REQUIRED_HEADERS.every(
    (header, index) => headerRow[index] === header
  );

  if (!headerValid) {
    throw new Error(
      "Invalid Excel template. Ensure the first row contains the columns: Note title, Question, Answer, Category."
    );
  }

  const dataRows = rows
    .slice(1)
    .map((row: (string | undefined)[]) => row)
    .filter((row: (string | undefined)[]) =>
      row.some((cell: string | undefined) => normalize(cell).length > 0)
    );

  if (dataRows.length === 0) {
    throw new Error("No data rows found in the uploaded Excel sheet.");
  }

  const notesSnapshot = await getDocs(
    query(
      collection(db, "notes"),
      where("subjectId", "==", subjectId),
      where("topicId", "==", topicId),
      where("isDeleted", "==", false)
    )
  );

  const noteMap = new Map<string, { id: string; title: string }>();
  notesSnapshot.forEach((noteDoc) => {
    const data = noteDoc.data() as { title?: string };
    const normalizedTitle = normalize(data.title);
    noteMap.set(normalizeKey(normalizedTitle), {
      id: noteDoc.id,
      title: normalizedTitle,
    });
  });

  let successCount = 0;

  for (const row of dataRows) {
    const normalizedCells = REQUIRED_HEADERS.map((_, index) =>
      normalize(row[index])
    );
    const [noteTitle, question, answer, category] = normalizedCells;

    if (!noteTitle || !question || !answer || !category) {
      continue;
    }

    const note = noteMap.get(normalizeKey(noteTitle));
    if (!note) {
      continue;
    }

    try {
      const timestamp = serverTimestamp();
      const docRef = await addDoc(collection(db, "flashcards"), {
        subjectId,
        topicId,
        noteId: note.id,
        question,
        answer,
        category,
        isDeleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      await updateDoc(docRef, {
        document_id: docRef.id,
      });

      successCount += 1;
    } catch (error) {
      console.error("Failed to import flashcard row:", error);
    }
  }

  const totalCount = dataRows.length;
  const skippedCount = totalCount - successCount;

  return {
    totalCount,
    successCount,
    skippedCount,
    storagePath: storageRef.fullPath,
  };
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
  lastVisibleDocs: Record<number, any | null> = {},
  searchQuery: string = ""
) => {
  try {
    const flashcardsRef = collection(db, "flashcards");

    if (searchQuery && searchQuery.trim() !== "") {
      const countQuery = query(
        flashcardsRef,
        where("subjectId", "==", subjectId),
        where("isDeleted", "==", false),
        where("question", ">=", searchQuery),
        where("question", "<=", searchQuery + "\uf8ff")
      );
      const totalSnap = await getCountFromServer(countQuery);
      const total = totalSnap.data().count;

      let q;
      if (page === 1 || !lastVisibleDocs[page - 1]) {
        q = query(
          flashcardsRef,
          where("subjectId", "==", subjectId),
          where("isDeleted", "==", false),
          where("question", ">=", searchQuery),
          where("question", "<=", searchQuery + "\uf8ff"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      } else {
        q = query(
          flashcardsRef,
          where("subjectId", "==", subjectId),
          where("isDeleted", "==", false),
          where("question", ">=", searchQuery),
          where("question", "<=", searchQuery + "\uf8ff"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisibleDocs[page - 1]),
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
    }
    // Get total matching documents
    const countQuery = query(
      flashcardsRef,
      where("subjectId", "==", subjectId),
      where("isDeleted", "==", false)
    );
    const totalSnap = await getCountFromServer(countQuery);
    const total = totalSnap.data().count;

    let q;
    if (page === 1 || !lastVisibleDocs[page - 1]) {
      q = query(
        flashcardsRef,
        where("subjectId", "==", subjectId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      q = query(
        flashcardsRef,
        where("subjectId", "==", subjectId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisibleDocs[page - 1]),
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
// Get count of flashcards by noteId
export const getFlashcardCountByNoteId = async (
  noteId: string
): Promise<number> => {
  try {
    if (!noteId) return 0;

    const q = query(
      collection(db, "flashcards"),
      where("noteId", "==", noteId),
      where("isDeleted", "==", false)
    );

    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error counting flashcards:", error);
    return 0;
  }
};

export const getFlashcardsByTopicId = async (
  topicId: string,
  page: number = 1,
  pageSize: number = 10,
  lastVisibleDocs: Record<number, any | null> = {},
  searchQuery: string = ""
) => {
  try {
    const flashcardsRef = collection(db, "flashcards");

    if (searchQuery && searchQuery.trim() !== "") {
      const countQuery = query(
        flashcardsRef,
        where("topicId", "==", topicId),
        where("isDeleted", "==", false),
        where("question", ">=", searchQuery),
        where("question", "<=", searchQuery + "\uf8ff")
      );
      const totalSnap = await getCountFromServer(countQuery);
      const total = totalSnap.data().count;

      let q;
      if (page === 1 || !lastVisibleDocs[page - 1]) {
        q = query(
          flashcardsRef,
          where("topicId", "==", topicId),
          where("isDeleted", "==", false),
          where("question", ">=", searchQuery),
          where("question", "<=", searchQuery + "\uf8ff"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      } else {
        q = query(
          flashcardsRef,
          where("topicId", "==", topicId),
          where("isDeleted", "==", false),
          where("question", ">=", searchQuery),
          where("question", "<=", searchQuery + "\uf8ff"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisibleDocs[page - 1]),
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
    }

    // Get total matching documents
    const countQuery = query(
      flashcardsRef,
      where("topicId", "==", topicId),
      where("isDeleted", "==", false)
    );
    const totalSnap = await getCountFromServer(countQuery);
    const total = totalSnap.data().count;

    let q;
    if (page === 1 || !lastVisibleDocs[page - 1]) {
      q = query(
        flashcardsRef,
        where("topicId", "==", topicId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      q = query(
        flashcardsRef,
        where("topicId", "==", topicId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(lastVisibleDocs[page - 1]),
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
