class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const comments = await this._commentRepository.getComments(threadId);
    return this._threadRepository.getThread(threadId, comments);
  }
}

module.exports = GetThreadUseCase;
