import express from 'express';
import { verifyToken } from '../services/authentication.service.js';
import { isTeacher } from '../services/tutor.service.js';
import * as blogCtrl from '../controllers/blog.js';

const router = express.Router();

// Public: list posts by teacher
router.get('/teacher/:tutorId', blogCtrl.listTeacherPosts);
router.get('/:postId', blogCtrl.getPost);

// Auth required for actions below
router.use(verifyToken);

// Teacher-only actions
router.post('/', isTeacher, blogCtrl.createBlog);
router.put('/:postId', isTeacher, blogCtrl.updateBlog);
router.delete('/:postId', isTeacher, blogCtrl.deleteBlog);

// Auth'd users can like/comment
router.post('/:postId/like', blogCtrl.likePost);
router.post('/:postId/unlike', blogCtrl.unlikePost);
router.post('/:postId/comment', blogCtrl.addComment);
router.put('/:postId/comment/:commentId', blogCtrl.editComment);
router.delete('/:postId/comment/:commentId', blogCtrl.deleteComment);

export default router;
