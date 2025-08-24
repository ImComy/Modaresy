export function onPostCreated(post) {
  return { event: 'post_created', postId: post._id };
}

export function onPostDeleted(postId) {
  return { event: 'post_deleted', postId };
}

export function onCommentAdded(postId, comment) {
  return { event: 'comment_added', postId, commentId: comment._id };
}

export function onLike(postId, userId) {
  return { event: 'post_liked', postId, userId };
}
