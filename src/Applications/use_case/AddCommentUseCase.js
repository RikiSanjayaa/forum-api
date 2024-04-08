const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, owner, threadId) {
    const addCommentPayload = new AddComment(useCasePayload);
    return this._commentRepository.addComment(addCommentPayload, owner, threadId);
  }
}

module.exports = AddCommentUseCase;
