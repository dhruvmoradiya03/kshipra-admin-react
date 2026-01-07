export interface Note {
  id?: string;
  created_at: string;
  document_id: string;
  is_active: boolean;
  order: number;
  pdf_url: string;
  subject_id: string;
  title: string;
  topic_id: string;
  total_flashcards: number;
  updated_at: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface Topic {
  id: string;
  created_at: string;
  document_id: string;
  is_active: boolean;
  order: number;
  subject_id: string;
  title: string;
  total_flashcards: number;
  total_notes: number;
  updated_at: string;
}
