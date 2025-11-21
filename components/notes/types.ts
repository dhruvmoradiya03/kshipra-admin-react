export interface Note {
  id?: number;
  subject: number;
  topic: number;
  title: string;
  file: string;
  description?: string;
  date?: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface Topic {
  id: number;
  name: string;
  subject: number;
}
