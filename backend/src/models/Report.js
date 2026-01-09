const { ObjectId } = require('mongodb');

/**
 * Report Model
 * Represents a generated Excel report
 */
class Report {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.facultyId = data.facultyId instanceof ObjectId ? data.facultyId : new ObjectId(data.facultyId);
    this.facultyName = data.facultyName;
    this.reportType = data.reportType; // 'detailed', 'summary'
    this.paperCount = data.paperCount || 0;
    this.filePath = data.filePath;
    this.fileName = data.fileName;
    this.generatedAt = data.generatedAt || new Date();
    this.sentToAdmin = data.sentToAdmin || false;
    this.downloadCount = data.downloadCount || 0;
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Validate report data
   */
  validate() {
    const errors = [];

    if (!this.facultyId) {
      errors.push('Faculty ID is required');
    }

    if (!this.facultyName || this.facultyName.trim().length === 0) {
      errors.push('Faculty name is required');
    }

    if (!['detailed', 'summary'].includes(this.reportType)) {
      errors.push('Invalid report type. Must be detailed or summary');
    }

    if (!this.filePath || this.filePath.trim().length === 0) {
      errors.push('File path is required');
    }

    if (!this.fileName || this.fileName.trim().length === 0) {
      errors.push('File name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Increment download count
   */
  incrementDownloadCount() {
    this.downloadCount += 1;
  }

  /**
   * Mark as sent to admin
   */
  markAsSent() {
    this.sentToAdmin = true;
  }

  /**
   * Convert to database document
   */
  toDocument() {
    return {
      _id: this._id,
      facultyId: this.facultyId,
      facultyName: this.facultyName,
      reportType: this.reportType,
      paperCount: this.paperCount,
      filePath: this.filePath,
      fileName: this.fileName,
      generatedAt: this.generatedAt,
      sentToAdmin: this.sentToAdmin,
      downloadCount: this.downloadCount,
      createdAt: this.createdAt
    };
  }

  /**
   * Create from database document
   */
  static fromDocument(doc) {
    return new Report(doc);
  }
}

module.exports = Report;
