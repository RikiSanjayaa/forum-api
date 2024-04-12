class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, owner) {
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.deleteComment(commentId, owner);
  }
}

module.exports = DeleteCommentUseCase;
