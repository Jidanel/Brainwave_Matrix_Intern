const express = require('express');
const auth = require('../middleware/auth'); // Middleware d'authentification
const Post = require('../models/Post');
const router = express.Router();

// Route pour créer un article (POST /api/posts)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({
      title,
      content,
      author: req.user.userId, // Récupéré depuis le middleware auth
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route pour récupérer tous les articles (GET /api/posts)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name'); // Affiche le nom de l'auteur
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recherche d'articles par mot-clé dans le titre ou le contenu
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.status(400).json({ error: 'Query parameter is required' });

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },      // Recherche insensible à la casse
        { content: { $regex: query, $options: 'i' } }
      ]
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour récupérer un article par ID (GET /api/posts/:id)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour mettre à jour un article (PUT /api/posts/:id)
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Vérifier que l'utilisateur est bien l'auteur de l'article
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.updatedAt = Date.now();

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route pour supprimer un article (DELETE /api/posts/:id)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Vérifier que l'utilisateur est bien l'auteur de l'article
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
