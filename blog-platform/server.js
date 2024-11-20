 // server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');


// Charger les variables d’environnement
dotenv.config();

// Connecter à MongoDB
connectDB();

// Initialiser Express
const app = express();

// Middleware pour parser les données JSON
app.use(express.json());

// Route de base pour tester le serveur
app.get('/', (req, res) => {
  res.send('Welcome to our Blog Platform API');
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// server.js
const postRoutes = require('./routes/posts');
app.use('/api/posts', postRoutes);

const commentRoutes = require('./routes/comments');
app.use('/api/posts', commentRoutes);

// Configurer le dossier "public" pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));


