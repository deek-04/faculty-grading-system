import * as XLSX from 'xlsx';

export interface GradingData {
  paperId: string;
  sectionId: string;
  studentName: string;
  rollNumber: string;
  questionMarks: { [key: string]: number };
  totalMarks: number;
  obtainedMarks: number;
  timeSpent: number;
  gradedAt: string;
  percentage: number;
  dummyNumber: string;
  courseCode: string;
}

export interface ExcelExportData {
  'Paper ID': string;
  'Section ID': string;
  'Student Name': string;
  'Roll Number': string;
  'Total Marks': number;
  'Obtained Marks': number;
  'Percentage': string;
  'Time Spent (min)': number;
  'Graded At': string;
  [key: string]: string | number; // For question marks (Q1, Q2, etc.)
}

export interface DummyNumberData {
  'Dummy Number': string;
  'Course Code': string;
  'Total Marks': number;
}

class ExcelExportService {
  private static instance: ExcelExportService;
  private gradingData: GradingData[] = [];

  private constructor() {}

  public static getInstance(): ExcelExportService {
    if (!ExcelExportService.instance) {
      ExcelExportService.instance = new ExcelExportService();
    }
    return ExcelExportService.instance;
  }

  public addGradingData(data: GradingData): void {
    // Remove existing entry for the same paper if it exists
    this.gradingData = this.gradingData.filter(item => item.paperId !== data.paperId);
    
    // Add new entry
    this.gradingData.push(data);
    
    console.log('Added grading data:', data);
    console.log('Total entries:', this.gradingData.length);
  }

  public exportToExcel(sectionId: string, courseCode: string = 'CS101'): void {
    if (this.gradingData.length === 0) {
      console.warn('No grading data to export');
      return;
    }

    // Filter data for the specific section
    const sectionData = this.gradingData.filter(item => item.sectionId === sectionId);
    
    if (sectionData.length === 0) {
      console.warn(`No grading data found for section ${sectionId}`);
      return;
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Detailed Grading Results
    const excelData: ExcelExportData[] = sectionData.map(item => {
      const baseData: ExcelExportData = {
        'Paper ID': item.paperId,
        'Section ID': item.sectionId,
        'Student Name': item.studentName,
        'Roll Number': item.rollNumber,
        'Total Marks': item.totalMarks,
        'Obtained Marks': item.obtainedMarks,
        'Percentage': `${item.percentage.toFixed(1)}%`,
        'Time Spent (min)': Math.round(item.timeSpent / 60),
        'Graded At': new Date(item.gradedAt).toLocaleString()
      };

      // Add question marks
      Object.entries(item.questionMarks).forEach(([questionId, marks]) => {
        const questionNumber = questionId.replace('q', 'Q');
        baseData[questionNumber] = marks;
      });

      return baseData;
    });

    const detailedWorksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns for detailed sheet
    const detailedColWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    detailedWorksheet['!cols'] = detailedColWidths;

    // Add detailed worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, detailedWorksheet, 'Detailed_Results');

    // Sheet 2: Dummy Numbers with Course Code and Total Marks
    const dummyData: DummyNumberData[] = sectionData.map(item => ({
      'Dummy Number': item.dummyNumber,
      'Course Code': item.courseCode,
      'Total Marks': item.obtainedMarks
    }));

    const dummyWorksheet = XLSX.utils.json_to_sheet(dummyData);

    // Auto-size columns for dummy sheet
    const dummyColWidths = [
      { wch: 15 }, // Dummy Number
      { wch: 12 }, // Course Code
      { wch: 12 }  // Total Marks
    ];
    dummyWorksheet['!cols'] = dummyColWidths;

    // Add dummy worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, dummyWorksheet, 'Dummy_Numbers');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `Grading_Results_${sectionId}_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);
    
    console.log(`Excel file exported with 2 sheets: ${filename}`);
  }

  public getGradingData(): GradingData[] {
    return [...this.gradingData];
  }

  public clearData(): void {
    this.gradingData = [];
  }

  public getGradedCount(sectionId: string): number {
    return this.gradingData.filter(item => item.sectionId === sectionId).length;
  }
}

export const excelExportService = ExcelExportService.getInstance();