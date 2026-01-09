const { ObjectId } = require('mongodb');

/**
 * Assignment Model
 * Represents a paper assignment to a faculty member
 */
class Assignment {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.facultyId = data.facultyId instanceof ObjectId ? data.facultyId : new ObjectId(data.facultyId);
    this.paperId = data.paperId instanceof ObjectId ? data.paperId : new ObjectId(data.paperId);
    this.courseCode = data.courseCode;
    this.dummyNumber = data.dummyNumber;
    this.assignedBy = data.assignedBy ? (data.assignedBy instanceof ObjectId ? data.assignedBy : new ObjectId(data.assignedBy)) : null;
    this.assignedAt = data.assignedAt || new Date();
    this.status = data.status || 'pending'; // 'pending', 'in_progress', 'completed'
    this.completedAt = data.completedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate assignment data
   */
  validate() {
    const errors = [];

    if (!this.facultyId) {
      errors.push('Faculty ID is required');
    }

    if (!this.paperId) {
      errors.push('Paper ID is required');
    }

    if (!this.courseCode || this.courseCode.trim().length === 0) {
      errors.push('Course code is required');
    }

    if (!this.dummyNumber || this.dummyNumber.trim().length === 0) {
      errors.push('Dummy number is required');
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
   * Mark assignment as in progress
   */
  startProgress() {
    this.status = 'in_progress';
    this.updatedAt = new Date();
  }

  /**
   * Mark assignment as completed
   */
  complete() {
    this.status = 'completed';
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Convert to database document
   */
  toDocument() {
    return {
      _id: this._id,
      facultyId: this.facultyId,
      paperId: this.paperId,
      courseCode: this.courseCode,
      dummyNumber: this.dummyNumber,
      assignedBy: this.assignedBy,
      assignedAt: this.assignedAt,
      status: this.status,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create from database document
   */
  static fromDocument(doc) {
    return new Assignment(doc);
  }
}

module.exports = Assignment;
