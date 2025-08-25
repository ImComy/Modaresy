import * as blogService from '../services/blog.service.js';

export async function createBlog(req, res) {
  try {
    if (!req.user || req.user.type !== 'Teacher') return res.status(403).json({ error: 'Only teachers can create posts' });
    const post = await blogService.createPost(req.user._id, req.body);
    return res.status(201).json({ post });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function updateBlog(req, res) {
  try {
    if (!req.user || req.user.type !== 'Teacher') return res.status(403).json({ error: 'Only teachers can edit posts' });
    const { postId } = req.params;
    const post = await blogService.updatePost(postId, req.user._id, req.body);
    return res.status(200).json({ post });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function deleteBlog(req, res) {
  try {
    if (!req.user || req.user.type !== 'Teacher') return res.status(403).json({ error: 'Only teachers can delete posts' });
    const { postId } = req.params;
    await blogService.deletePost(postId, req.user._id);
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function listTeacherPosts(req, res) {
  try {
    const { tutorId } = req.params;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '12', 10);
    const result = await blogService.getPostsByTeacher(tutorId, { page, limit });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function getPost(req, res) {
  try {
    const { postId } = req.params;
    const post = await blogService.getPostById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    return res.status(200).json(post);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function likePost(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { postId } = req.params;
    const result = await blogService.likePost(postId, req.user._id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function unlikePost(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { postId } = req.params;
    const result = await blogService.unlikePost(postId, req.user._id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function addComment(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { postId } = req.params;
    const { text } = req.body;
    console.log('addComment: request', { postId, user: req.user && req.user._id, text: text ? String(text).slice(0, 50) : '' });
    const comment = await blogService.addComment(postId, req.user._id, text);
  return res.status(201).json({ comment });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function deleteComment(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { postId, commentId } = req.params;
    console.log('deleteComment: request', { postId, commentId, user: req.user && req.user._id });
    await blogService.deleteComment(postId, commentId, req.user._id);
    return res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function editComment(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { postId, commentId } = req.params;
    const { text } = req.body;
  const comment = await blogService.editComment(postId, commentId, req.user._id, text);
    return res.status(200).json({ comment });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
