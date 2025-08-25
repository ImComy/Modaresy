import { Blog } from '../models/blog.js';
import mongoose from 'mongoose';

export async function createPost(teacherId, { title, content }) {
  if (!title || !content) throw new Error('title and content are required');
  const post = new Blog({ teacher: teacherId, title, content });
  await post.save();
  await post.populate('teacher', '-password');
  await post.populate({ path: 'comments.user', select: 'name profile_picture img type' });
  return post;
}

export async function updatePost(postId, teacherId, updates) {
  const post = await Blog.findById(postId);
  if (!post) throw new Error('Post not found');
  if (post.teacher.toString() !== teacherId.toString()) throw new Error('Not authorized');

  if (updates.title !== undefined) post.title = updates.title;
  if (updates.content !== undefined) post.content = updates.content;
  post.updatedAt = new Date();
  await post.save();
  return post;
}

export async function deletePost(postId, teacherId) {
  const post = await Blog.findById(postId);
  if (!post) throw new Error('Post not found');
  if (post.teacher.toString() !== teacherId.toString()) throw new Error('Not authorized');
  await post.deleteOne();
  return true;
}

export async function getPostsByTeacher(teacherId, { page = 1, limit = 12 } = {}) {
  const skip = Math.max(0, (page - 1) * limit);
  const posts = await Blog.find({ teacher: teacherId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('teacher', '-password')
    .populate({ path: 'comments.user', select: 'name profile_picture img type' })
    .lean();
    const total = await Blog.countDocuments({ teacher: teacherId });
  return { posts, total };
}

export async function getPostById(postId) {
  const post = await Blog.findById(postId)
    .populate('teacher', '-password')
    .populate({ path: 'comments.user', select: 'name profile_picture img type' })
    .lean();
  return post;
}

export async function likePost(postId, userId) {
  const post = await Blog.findById(postId);
  if (!post) throw new Error('Post not found');
  const uid = userId.toString();
  if (!post.likes) post.likes = [];
  if (!post.likes.map(l => l.toString()).includes(uid)) {
  post.likes.push(new mongoose.Types.ObjectId(uid));
    await post.save();
    return { liked: true, likesCount: post.likes.length };
  }
  return { liked: false, likesCount: post.likes.length };
}

export async function unlikePost(postId, userId) {
  const post = await Blog.findById(postId);
  if (!post) throw new Error('Post not found');
  const uid = userId.toString();
  post.likes = (post.likes || []).filter(l => l.toString() !== uid);
  await post.save();
  return { liked: false, likesCount: post.likes.length };
}

export async function addComment(postId, userId, text) {
  if (!text) throw new Error('Comment text required');
  const post = await Blog.findById(postId);
  if (!post) throw new Error('Post not found');
  const comment = { user: new mongoose.Types.ObjectId(userId), text, createdAt: new Date() };
  post.comments = post.comments || [];
  post.comments.push(comment);
  await post.save();
  await post.populate({ path: 'comments.user', select: 'name profile_picture img type' });
  return post.comments[post.comments.length - 1];
}

export async function deleteComment(postId, commentId, userId) {
  const post = await Blog.findById(postId);
  if (!post) throw new Error('Post not found');

  const comment = post.comments.id(commentId);
  if (!comment) throw new Error('Comment not found');

  const commentUserId = comment.user && comment.user._id ? String(comment.user._id) : String(comment.user);
  const postTeacherId = post.teacher && post.teacher._id ? String(post.teacher._id) : String(post.teacher);
  const requesterId = String(userId);

  if (commentUserId !== requesterId && postTeacherId !== requesterId) {
    throw new Error('Not authorized to delete comment');
  }

  const before = post.comments.length;
  post.comments = (post.comments || []).filter((c) => String(c._id) !== String(commentId));
  if (post.comments.length === before) {
    throw new Error('Comment not found or already removed');
  }

  await post.save();
  return true;
}


export async function editComment(postId, commentId, userId, text) {
  if (!text) throw new Error('Comment text required');
  const post = await Blog.findById(postId);
  if (!post) throw new Error('Post not found');
  const comment = post.comments.id(commentId);
  if (!comment) throw new Error('Comment not found');
  if (comment.user.toString() !== userId.toString()) {
    throw new Error('Not authorized to edit comment');
  }
  comment.text = text;
  comment.updatedAt = new Date();
  await post.save();
  return comment;
}
