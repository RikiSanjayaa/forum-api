const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const GettedThread = require('../../Domains/threads/entities/GettedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThreadPayload, owner) {
    const { title, body } = addThreadPayload;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getThread(threadId) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, users.username AS username, threads.date
            FROM threads 
            LEFT JOIN users ON threads.owner = users.id 
            WHERE threads.id = $1`,
      values: [threadId],
    };

    const commentQuery = {
      text: `SELECT comments.id, users.username AS username, comments.date, comments.content
            FROM comments
            LEFT JOIN users ON comments.owner = users.id 
            WHERE comments.thread_id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    const commentResult = await this._pool.query(commentQuery);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return new GettedThread({ ...result.rows[0], comments: commentResult.rows });
  }
}

module.exports = ThreadRepositoryPostgres;
