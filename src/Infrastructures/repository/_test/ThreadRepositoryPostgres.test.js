const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyThreadId function', () => {
    it('should throw error 404 when thread id is not found', async () => {
      // Arrange
      const fakeThreadId = 'xxx';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadId(fakeThreadId))
        .rejects.toThrow('Thread tidak ditemukan');
    });
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'a thread title',
        body: 'somebody....',
      });
      const fakeIdGenerator = () => '123'; // stub
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const owner = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const date = new Date().toISOString();

      // Action
      await threadRepositoryPostgres.addThread(addThread, owner, date);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'a thread title',
        body: 'somebody....',
      });
      const fakeId = () => '123'; // stub
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const owner = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeId);
      const date = new Date().toISOString();

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread, owner, date);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'a thread title',
        owner: 'user-123',
      }));
    });
  });

  describe('getThread function', () => {
    it('should return getted thread correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const realThreadId = 'thread-123';
      const date = new Date().toISOString();
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: realThreadId, date, owner });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const gettedThread = await threadRepositoryPostgres.getThread(realThreadId);

      // Assert
      expect(gettedThread).toBeDefined();
      expect(gettedThread.id).toStrictEqual(realThreadId);
      expect(gettedThread.title).toStrictEqual('title thread');
      expect(gettedThread.body).toStrictEqual('isi dari thread');
      expect(gettedThread.username).toStrictEqual('dicoding');
      expect(gettedThread.date).toStrictEqual(date);
    });
  });
});
