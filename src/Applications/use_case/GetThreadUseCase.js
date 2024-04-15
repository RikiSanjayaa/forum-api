const GettedThread = require('../../Domains/threads/entities/GettedThread');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const rawComments = await this._commentRepository.getComments(threadId);
    const comments = this._filterDeletedComments(rawComments);
    await this._threadRepository.verifyThreadId(threadId);
    const thread = await this._threadRepository.getThread(threadId);
    return new GettedThread({ ...thread, comments });
  }

  _filterDeletedComments(comments) {
    return comments.map((comment) => {
      // ubah content jika comment.is_deleted = true
      const content = comment.is_deleted === true ? '**komentar telah dihapus**' : comment.content;
      return {
        id: comment.id,
        username: comment.username,
        content,
      };
    });
  }
}

module.exports = GetThreadUseCase;
