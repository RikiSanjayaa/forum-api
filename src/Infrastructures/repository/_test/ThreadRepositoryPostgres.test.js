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
  });

  afterAll(async () => {
    await pool.end();
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

      // Action
      await threadRepositoryPostgres.addThread(addThread, owner);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'a thread title',
        body: 'somebody....',
      });
      const fakeId = () => '123'; // stub
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const owner = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeId);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread, owner);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'a thread title',
        owner: 'user-123',
      }));
    });
  });

  describe('getThread function', () => {
    it('should throw error 404 when thread id is not found', async () => {
      // Arrange
      const fakeThreadId = 'thread-1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action and Assert
      await expect(threadRepositoryPostgres.getThread(fakeThreadId)).rejects.toThrow('Thread tidak ditemukan');
    });

    it('should return getted thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', date: new Date().toISOString() });
      const realThreadId = 'thread-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const gettedThread = await threadRepositoryPostgres.getThread(realThreadId);

      // Assert
      expect(gettedThread).toBeDefined();
    });
  });
});
