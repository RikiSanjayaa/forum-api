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

  async verifyThreadId(threadId) {
    const verifyQuery = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };
    const verifyResult = await this._pool.query(verifyQuery);

    if (verifyResult.rowCount === 0) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }

  async addThread(addThreadPayload, owner, date) {
    const { title, body } = addThreadPayload;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getThread(threadId, comments) {
    await this.verifyThreadId(threadId);

    const query = {
      text: `SELECT threads.id, threads.title, threads.body, users.username AS username, threads.date
            FROM threads 
            LEFT JOIN users ON threads.owner = users.id 
            WHERE threads.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return new GettedThread({ ...result.rows[0], comments });
  }
}

module.exports = ThreadRepositoryPostgres;
