const GettedThread = require('../../Domains/threads/entities/GettedThread');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, userRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
  }

  async execute(threadId) {
    let comments = await this._commentRepository.getComments(threadId);
    comments = await Promise.all(comments.map(async (comment) => {
      const { username } = await this._userRepository.getUsernameById(comment.owner);
      return {
        id: comment.id,
        username,
        date: comment.date,
        // ubah content jika comment.is_deleted = true
        content: comment.is_deleted === true ? '**komentar telah dihapus**' : comment.content,
      };
    }));
    await this._threadRepository.verifyThreadId(threadId);
    const thread = await this._threadRepository.getThread(threadId);
    return new GettedThread({ ...thread, comments });
  }
}

module.exports = GetThreadUseCase;
