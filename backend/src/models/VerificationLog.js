const { ObjectId } = require('mongodb');

/**
 * VerificationLog Model
 * Represents an audit log entry for faculty verification actions
 */
class VerificationLog {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.facultyId = data.facultyId instanceof ObjectId ? data.facultyId : new ObjectId(data.facultyId);
    this.adminId = data.adminId ? (data.adminId instanceof ObjectId ? data.adminId : new ObjectId(data.adminId)) : null;
    this.action = data.action; // 'blocked', 'verified', 'pending'
    this.reason = data.reason || '';
    this.timestamp = data.timestamp || new Date();
    this.metadata = data.metadata || {};
  }

  /**
   * Validate verification log data
   */
  validate() {
    const errors = [];

    if (!this.facultyId) {
      errors.push('Faculty ID is required');
    }

    if (!['blocked', 'verified', 'pending'].includes(this.action)) {
      errors.push('Invalid action. Must be blocked, verified, or pending');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to database document
   */
  toDocument() {
    return {
      _id: this._id,
      facultyId: this.facultyId,
      adminId: this.adminId,
      action: this.action,
      reason: this.reason,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }

  /**
   * Create from database document
   */
  static fromDocument(doc) {
    return new VerificationLog(doc);
  }
}

module.exports = VerificationLog;
