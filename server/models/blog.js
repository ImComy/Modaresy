import mongoose, { Schema } from 'mongoose';

const CommentSchema = new Schema({
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const BlogSchema = new Schema({
  teacher: { type: mongoose.Types.ObjectId, ref: 'Teacher', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: [{
    filename: String,
    originalname: String,
    path: String,
    url: String,
  }],
  likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Blog = mongoose.model('Blog', BlogSchema);
