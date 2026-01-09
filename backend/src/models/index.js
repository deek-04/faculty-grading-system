/**
 * Models Index
 * Exports all database models
 */

const Faculty = require('./Faculty');
const Evaluation = require('./Evaluation');
const Assignment = require('./Assignment');
const Report = require('./Report');
const VerificationLog = require('./VerificationLog');

module.exports = {
  Faculty,
  Evaluation,
  Assignment,
  Report,
  VerificationLog
};
