const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async _verifyThreadId(threadId) {
    const verifyQuery = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };
    const verifyResult = await this._pool.query(verifyQuery);

    if (verifyResult.rowCount === 0) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }

  async addComment(addCommentPayload, owner, threadId) {
    const { content } = addCommentPayload;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDeleted = false;
    await this._verifyThreadId(threadId);

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, date, threadId, isDeleted],
    };
    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment(threadId, commentId, owner) {
    await this._verifyThreadId(threadId);
    const verifyQuery = {
      text: 'SELECT id, owner FROM comments WHERE id = $1',
      values: [commentId],
    };
    const verifyResult = await this._pool.query(verifyQuery);

    // verify commentId
    if (verifyResult.rowCount === 0) {
      throw new NotFoundError('Comment tidak ditemukan');
    }

    // verify owner
    if (verifyResult.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda bukan pemilik dari comment ini');
    }

    // soft delete comment
    const query = {
      text: "UPDATE comments SET is_deleted = true, content = '**komentar telah dihapus**' WHERE ID = $1",
      values: [commentId],
    };
    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
