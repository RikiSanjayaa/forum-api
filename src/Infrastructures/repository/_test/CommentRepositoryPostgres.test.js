const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should throw NotFoundError if threadId is not found', async () => {
      // Arrange
      const addCommentPayload = new AddComment({
        content: 'a comment',
      });
      const fakeIdGenerator = () => '123'; // stub
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action and Assert
      await expect(commentRepositoryPostgres.addComment(addCommentPayload, owner, threadId)).rejects.toThrow('Thread tidak ditemukan');
    });

    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const addCommentPayload = new AddComment({
        content: 'a comment',
      });
      const fakeIdGenerator = () => '123'; // stub
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', date: new Date().toISOString() });
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addCommentPayload, owner, threadId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addCommentPayload = new AddComment({
        content: 'a comment',
      });
      const fakeIdGenerator = () => '123'; // stub
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', date: new Date().toISOString() });

      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres
        .addComment(addCommentPayload, owner, threadId);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'a comment',
        owner: 'user-123',
      }));
    });
  });
});
