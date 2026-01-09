const { MongoClient } = require('mongodb');
require('dotenv').config();

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/online_valuation_system';
      const dbName = process.env.DB_NAME || 'online_valuation_system';

      console.log('Connecting to MongoDB...');
      console.log('URI:', uri);
      console.log('Database:', dbName);

      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(dbName);

      // Test the connection
      await this.db.command({ ping: 1 });
      console.log('✓ Successfully connected to MongoDB');

      // Create indexes
      await this.createIndexes();

      return this.db;
    } catch (error) {
      console.error('✗ MongoDB connection error:', error.message);
      throw error;
    }
  }

  async createIndexes() {
    try {
      console.log('Creating database indexes...');

      // Faculty indexes - use sparse for unique indexes to allow missing fields
      await this.db.collection('faculties').createIndex(
        { employeeId: 1 }, 
        { unique: true, sparse: true }
      ).catch(err => console.log('Faculty employeeId index exists or failed:', err.message));
      
      await this.db.collection('faculties').createIndex(
        { email: 1 }, 
        { unique: true, sparse: true }
      ).catch(err => console.log('Faculty email index exists or failed:', err.message));
      
      await this.db.collection('faculties').createIndex({ status: 1 })
        .catch(err => console.log('Faculty status index exists or failed:', err.message));
      
      await this.db.collection('faculties').createIndex({ name: 'text' })
        .catch(err => console.log('Faculty name text index exists or failed:', err.message));

      // Evaluations indexes
      await this.db.collection('evaluations').createIndex({ facultyId: 1 })
        .catch(err => console.log('Evaluations facultyId index exists or failed:', err.message));
      
      await this.db.collection('evaluations').createIndex({ paperId: 1 })
        .catch(err => console.log('Evaluations paperId index exists or failed:', err.message));
      
      await this.db.collection('evaluations').createIndex({ status: 1 })
        .catch(err => console.log('Evaluations status index exists or failed:', err.message));
      
      await this.db.collection('evaluations').createIndex({ facultyId: 1, status: 1 })
        .catch(err => console.log('Evaluations compound index exists or failed:', err.message));

      // Assignments indexes
      await this.db.collection('assignments').createIndex({ facultyId: 1 })
        .catch(err => console.log('Assignments facultyId index exists or failed:', err.message));
      
      await this.db.collection('assignments').createIndex({ paperId: 1 })
        .catch(err => console.log('Assignments paperId index exists or failed:', err.message));
      
      await this.db.collection('assignments').createIndex({ status: 1 })
        .catch(err => console.log('Assignments status index exists or failed:', err.message));
      
      await this.db.collection('assignments').createIndex(
        { facultyId: 1, paperId: 1 }, 
        { unique: true }
      ).catch(err => console.log('Assignments unique compound index exists or failed:', err.message));

      // Reports indexes
      await this.db.collection('reports').createIndex({ facultyId: 1 })
        .catch(err => console.log('Reports facultyId index exists or failed:', err.message));
      
      await this.db.collection('reports').createIndex({ generatedAt: -1 })
        .catch(err => console.log('Reports generatedAt index exists or failed:', err.message));

      console.log('✓ Database indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error.message);
      // Don't throw - indexes might already exist
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Singleton instance
const database = new Database();

module.exports = database;
