const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addCommentPayload, owner, threadId) {
    const { content } = addCommentPayload;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDeleted = false;

    // Verify threadId
    const verifyQuery = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };
    const verifyResult = await this._pool.query(verifyQuery);

    if (verifyResult.rowCount === 0) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, date, threadId, isDeleted],
    };
    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }
}

module.exports = CommentRepositoryPostgres;
