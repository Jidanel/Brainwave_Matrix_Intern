const express = require('express');
const auth = require('../middleware/auth'); // Middleware d'authentification
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const router = express.Router();

// Ajouter un commentaire à un article
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = new Comment({
      content,
      author: req.user.userId,
      post: postId
    });
    await comment.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtenir tous les commentaires d'un article
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId }).populate('author', 'name');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un commentaire (par l'auteur du commentaire)
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await comment.remove();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
