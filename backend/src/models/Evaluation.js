const { ObjectId } = require('mongodb');

/**
 * Evaluation Model
 * Represents a paper evaluation/grading by a faculty
 */
class Evaluation {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.facultyId = data.facultyId instanceof ObjectId ? data.facultyId : new ObjectId(data.facultyId);
    this.paperId = data.paperId instanceof ObjectId ? data.paperId : new ObjectId(data.paperId);
    this.studentId = data.studentId ? (data.studentId instanceof ObjectId ? data.studentId : new ObjectId(data.studentId)) : null;
    this.dummyNumber = data.dummyNumber;
    this.courseCode = data.courseCode;
    this.questionMarks = data.questionMarks || {};
    this.totalMarks = data.totalMarks || 100;
    this.obtainedMarks = data.obtainedMarks || 0;
    this.percentage = data.percentage || 0;
    this.correctionTime = data.correctionTime || 0; // in seconds
    this.status = data.status || 'pending'; // 'pending', 'in_progress', 'completed'
    this.startedAt = data.startedAt || null;
    this.completedAt = data.completedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate evaluation data
   */
  validate() {
    const errors = [];

    if (!this.facultyId) {
      errors.push('Faculty ID is required');
    }

    if (!this.paperId) {
      errors.push('Paper ID is required');
    }

    if (!this.dummyNumber || this.dummyNumber.trim().length === 0) {
      errors.push('Dummy number is required');
    }

    if (!this.courseCode || this.courseCode.trim().length === 0) {
      errors.push('Course code is required');
    }

    if (this.obtainedMarks > this.totalMarks) {
      errors.push('Obtained marks cannot exceed total marks');
    }

    if (!['pending', 'in_progress', 'completed'].includes(this.status)) {
      errors.push('Invalid status');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Mark evaluation as started
   */
  start() {
    this.status = 'in_progress';
    this.startedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Mark evaluation as completed
   */
  complete() {
    this.status = 'completed';
    this.completedAt = new Date();
    this.updatedAt = new Date();
    
    // Calculate correction time if started
    if (this.startedAt) {
      this.correctionTime = Math.floor((this.completedAt - this.startedAt) / 1000);
    }
  }

  /**
   * Calculate percentage
   */
  calculatePercentage() {
    if (this.totalMarks > 0) {
      this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
    }
    return this.percentage;
  }

  /**
   * Convert to database document
   */
  toDocument() {
    return {
      _id: this._id,
      facultyId: this.facultyId,
      paperId: this.paperId,
      studentId: this.studentId,
      dummyNumber: this.dummyNumber,
      courseCode: this.courseCode,
      questionMarks: this.questionMarks,
      totalMarks: this.totalMarks,
      obtainedMarks: this.obtainedMarks,
      percentage: this.percentage,
      correctionTime: this.correctionTime,
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create from database document
   */
  static fromDocument(doc) {
    return new Evaluation(doc);
  }
}

module.exports = Evaluation;
