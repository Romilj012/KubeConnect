const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI (replace with actual credentials in deployment)
const mongoUri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongodb-service:27017/?authSource=admin`;

// Connect to MongoDB
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Node.js + MongoDB!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
