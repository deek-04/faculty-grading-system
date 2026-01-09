const { ObjectId } = require('mongodb');

/**
 * Faculty Model
 * Represents a faculty member in the system
 */
class Faculty {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.name = data.name;
    this.email = data.email;
    this.employeeId = data.employeeId;
    this.department = data.department;
    this.status = data.status || 'pending'; // 'verified', 'blocked', 'pending'
    this.profileFaceUrl = data.profileFaceUrl || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastActive = data.lastActive || new Date();
    this.verificationReason = data.verificationReason || '';
  }

  /**
   * Validate faculty data
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }

    if (!this.employeeId || this.employeeId.trim().length === 0) {
      errors.push('Employee ID is required');
    }

    if (!['verified', 'blocked', 'pending'].includes(this.status)) {
      errors.push('Invalid status. Must be verified, blocked, or pending');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert to database document
   */
  toDocument() {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      employeeId: this.employeeId,
      department: this.department,
      status: this.status,
      profileFaceUrl: this.profileFaceUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastActive: this.lastActive,
      verificationReason: this.verificationReason
    };
  }

  /**
   * Create from database document
   */
  static fromDocument(doc) {
    return new Faculty(doc);
  }
}

module.exports = Faculty;
