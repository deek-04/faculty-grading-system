export interface DemoAnswerFileRef {
  url: string;
  mimeType: string;
}

export interface DemoPaperUpload {
  id: string;
  courseId: string;
  courseName: string;
  assignedFacultyId?: string;
  questionPaperUrl?: string; // object URL
  answerKeyUrl?: string; // object URL
  // legacy: kept for backward compatibility
  answerPaperUrls: string[]; // object URLs (images or pdfs)
  // new: includes mime types for reliable filtering
  answerPapers?: DemoAnswerFileRef[];
  createdAt: string;
}

class DemoStore {
  private static instance: DemoStore;
  private papers: DemoPaperUpload[] = [];

  static getInstance(): DemoStore {
    if (!DemoStore.instance) {
      DemoStore.instance = new DemoStore();
    }
    return DemoStore.instance;
  }

  addPaper(upload: Omit<DemoPaperUpload, 'id' | 'createdAt'>): DemoPaperUpload {
    const record: DemoPaperUpload = {
      id: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...upload,
    };
    this.papers.unshift(record);
    return record;
  }

  getPapers(): DemoPaperUpload[] {
    return [...this.papers];
  }

  getPapersForFaculty(facultyId?: string): DemoPaperUpload[] {
    if (!facultyId) return this.getPapers();
    const targeted = this.papers.filter(p => p.assignedFacultyId === facultyId);
    return targeted.length ? targeted : this.getPapers();
  }
}

export const demoStore = DemoStore.getInstance();


