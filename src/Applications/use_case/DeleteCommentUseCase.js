class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, owner) {
    await this._commentRepository.deleteComment(threadId, commentId, owner);
  }
}

module.exports = DeleteCommentUseCase;
