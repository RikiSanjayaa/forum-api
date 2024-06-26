const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload, owner, threadId) {
    await this._threadRepository.verifyThreadId(threadId);
    const isDeleted = false;
    const addCommentPayload = new AddComment(payload);
    return this._commentRepository.addComment(addCommentPayload, owner, threadId, isDeleted);
  }
}

module.exports = AddCommentUseCase;
