require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Resource = require('./models/Resource');

const resources = [
  {
    title: 'MongoDB Official Docs',
    url: 'https://www.mongodb.com/docs',
    description: 'Complete reference for MongoDB.',
    tags: ['mongodb', 'database'],
  },
  {
    title: 'React Official Docs',
    url: 'https://react.dev',
    description: 'Learn React from the source.',
    tags: ['react', 'frontend', 'javascript'],
  },
  {
    title: 'Express.js Guide',
    url: 'https://expressjs.com',
    description: 'Fast, minimalist backend framework docs.',
    tags: ['express', 'backend', 'nodejs'],
  },
  {
    title: 'Socket.IO Docs',
    url: 'https://socket.io/docs',
    description: 'Real-time engine documentation.',
    tags: ['socket.io', 'realtime', 'websockets'],
  },
  {
    title: 'JWT Introduction',
    url: 'https://jwt.io/introduction',
    description: 'Understand how JSON Web Tokens work.',
    tags: ['jwt', 'authentication', 'security'],
  },
  {
    title: 'Tailwind CSS Docs',
    url: 'https://tailwindcss.com/docs',
    description: 'Utility-first CSS framework reference.',
    tags: ['tailwind', 'css', 'frontend'],
  },
];

const runSeed = async () => {
  await connectDB();
  await Resource.deleteMany(); // clear out old seed data first, so re-running this doesn't duplicate
  await Resource.insertMany(resources);
  console.log('Resources seeded successfully');
  mongoose.connection.close();
};

runSeed();