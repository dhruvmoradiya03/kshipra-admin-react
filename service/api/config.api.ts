import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase.config";
import { getStorage } from "firebase/storage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Subject {
  id?: string;
  name: string;
  createdAt: any;
  updatedAt: any;
}

interface Topic {
  id?: string;
  subjectId: string;
  name: string;
  createdAt: any;
  updatedAt: any;
}

export const handleUpload = async (
  file: File,
  folderName: string = "notes"
) => {
  const storage = getStorage();

  // Get original filename and extension
  const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  // Create a unique filename with original name and timestamp
  const timestamp = Date.now();
  const newFileName = `${originalName}.${fileExtension}`;

  // Create storage reference with the new filename
  const storageRef = ref(storage, `uploads/${folderName}/${newFileName}`);

  try {
    // Check if the file is a PDF
    if (file.type !== "application/pdf") {
      throw new Error("Only PDF files are allowed");
    }

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const handleImageUpload = async (
  file: File,
  folderName: string = "mentors"
) => {
  const storage = getStorage();

  // Get original filename and extension
  const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  // Create a unique filename with original name and timestamp
  const timestamp = Date.now();
  const newFileName = `${originalName}.${fileExtension}`;
  // Restore cleaner filename logic if desired, or keep unique. 
  // Staying consistent with previous iterations, I'll use the unique timestamp one if that was working, 
  // but standard practice is often just name+ext or uuid. 
  // Let's use the unique one to avoid conflicts.
  const uniqueFileName = `${originalName}_${timestamp}.${fileExtension}`;


  // Create storage reference with the new filename
  const storageRef = ref(storage, `uploads/${folderName}/${uniqueFileName}`);

  try {
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const getSubjects = async () => {
  try {
    console.log("Fetching subjects...");
    const subjectsRef = collection(db, "subjects");
    const querySnapshot = await getDocs(subjectsRef);
    const subjects = querySnapshot.docs.map((doc) => doc.data());
    return subjects;
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

export const postSeed = async () => {
  try {
    const subjectsData = [
      { name: "Anatomy" },
      { name: "Pharmacy" },
      { name: "Botany" },
      { name: "Zoology" },
    ];

    const topicsData = [
      { name: "test1", subjectIndex: 0 },
      { name: "test5", subjectIndex: 0 },
      { name: "test6", subjectIndex: 0 },
      { name: "test2", subjectIndex: 1 },
      { name: "test7", subjectIndex: 1 },
      { name: "test8", subjectIndex: 1 },
      { name: "test3", subjectIndex: 2 },
      { name: "test9", subjectIndex: 2 },
      { name: "test10", subjectIndex: 2 },
      { name: "test4", subjectIndex: 3 },
      { name: "test11", subjectIndex: 3 },
      { name: "test12", subjectIndex: 3 },
    ];

    // Add subjects
    const subjectsRef = collection(db, "subjects");
    const addedSubjects: any[] = [];

    for (const subject of subjectsData) {
      const timestamp = serverTimestamp();
      const subjectData: Subject = {
        name: subject.name,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const docRef = await addDoc(subjectsRef, subjectData);
      addedSubjects.push({ id: docRef.id, ...subjectData });
    }

    // Add topics with proper subject references
    const topicsRef = collection(db, "topics");

    for (const topic of topicsData) {
      const subject = addedSubjects[topic.subjectIndex];
      if (!subject) continue;

      const timestamp = serverTimestamp();
      const topicData: Topic = {
        subjectId: subject.id,
        name: topic.name,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await addDoc(topicsRef, topicData);
    }

    console.log("Seed data added successfully!");
    return { success: true, message: "Seed data added successfully" };
  } catch (error) {
    console.error("Error seeding data:", error);
    return { success: false, error: "Failed to seed data" };
  }
};

export const getTopics = async (subjectId: string) => {
  try {
    const topicsRef = collection(db, "topics");

    const querySnapshot = await getDocs(
      query(topicsRef, where("subjectId", "==", subjectId))
    );
    const topics = querySnapshot.docs.map((doc) => doc.data());
    return topics;
  } catch (error: any) {
    console.error("Error fetching topics:", error);
    throw error;
  }
};

interface Note {
  id?: string;
  subjectId: string;
  topicId: string;
  title: string;
  file: string;
  isDeleted: boolean;
  createdAt: any;
  updatedAt: any;
}

export const postSeedNotes = async () => {
  try {
    // Get all topics with their names and subject references
    const topicsRef = collection(db, "topics");
    const topicsSnapshot = await getDocs(topicsRef);

    // Create a map of topic names to their document data
    const topicsMap = new Map<string, { id: string; subjectId: string }>();

    topicsSnapshot.docs.forEach((doc) => {
      const topicData = doc.data();
      topicsMap.set(topicData.name, {
        id: doc.id,
        subjectId: topicData.subjectId,
      });
    });

    // Note data with topic names
    const notesData = [
      { topic: "test1", title: "test1", file: "test1.pdf" },
      { topic: "test2", title: "test2", file: "test2.pdf" },
      { topic: "test3", title: "test3", file: "test3.pdf" },
      { topic: "test4", title: "test4", file: "test4.pdf" },
      { topic: "test5", title: "test5", file: "test5.pdf" },
      { topic: "test6", title: "test6", file: "test6.pdf" },
      { topic: "test7", title: "test7", file: "test7.pdf" },
      { topic: "test8", title: "test8", file: "test8.pdf" },
      { topic: "test9", title: "test9", file: "test9.pdf" },
      { topic: "test10", title: "test10", file: "test10.pdf" },
      { topic: "test11", title: "test11", file: "test11.pdf" },
      { topic: "test12", title: "test12", file: "test12.pdf" },
    ];

    // Add notes to Firestore
    const notesRef = collection(db, "notes");
    const timestamp = serverTimestamp();
    let successCount = 0;
    let errorCount = 0;

    for (const note of notesData) {
      const topicInfo = topicsMap.get(note.topic);

      if (!topicInfo) {
        console.warn(
          `Skipping note "${note.title}" - topic "${note.topic}" not found`
        );
        errorCount++;
        continue;
      }

      try {
        const noteData: Note = {
          subjectId: topicInfo.subjectId,
          topicId: topicInfo.id,
          title: note.title,
          file: note.file,
          isDeleted: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        await addDoc(notesRef, noteData);
        successCount++;
      } catch (error) {
        console.error(`Error adding note "${note.title}":`, error);
        errorCount++;
      }
    }

    console.log(
      `Notes seeding completed. Success: ${successCount}, Failed: ${errorCount}`
    );
    return {
      success: errorCount === 0,
      message: `Notes seeding completed. Success: ${successCount}, Failed: ${errorCount}`,
    };
  } catch (error) {
    console.error("Error in postSeedNotes:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to seed notes data",
    };
  }
};
