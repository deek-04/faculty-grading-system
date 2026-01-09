const { MongoClient, ObjectId } = require('mongodb');

async function seedRealisticData() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('online_valuation_system');
    
    console.log('🌱 Seeding realistic