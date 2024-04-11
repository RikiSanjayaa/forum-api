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

  describe('deleteComment function', () => {
    it('should throw NotFound error if threadId is not found', async () => {
      // Arrange
      const fakeThreadId = 'xxx';
      const fakeCommentId = 'xxx';
      const fakeIdGenerator = () => '123'; // stub
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const owner = 'user-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action and Assert
      await expect(commentRepositoryPostgres.deleteComment(fakeThreadId, fakeCommentId, owner))
        .rejects.toThrow('Thread tidak ditemukan');
    });

    it('should throw NotFound error if commentId is not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', date: new Date().toISOString() });

      const owner = 'user-123';
      const threadId = 'thread-123';
      const fakeCommentId = 'xxx';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteComment(threadId, fakeCommentId, owner))
        .rejects.toThrow('Comment tidak ditemukan');
    });

    it('should throw AuthorizationError if Comment owner != current user', async () => {
      // Arrange
      const addCommentPayload = new AddComment({
        content: 'a comment',
      });
      const fakeIdGenerator = () => '123'; // stub
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', date: new Date().toISOString() });

      const owner = 'user-123';
      const fakeOwner = 'user-1234';
      const threadId = 'thread-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // adding real comment
      const addedComment = await commentRepositoryPostgres
        .addComment(addCommentPayload, owner, threadId);

      // Action and Assert
      await expect(commentRepositoryPostgres.deleteComment(threadId, addedComment.id, fakeOwner))
        .rejects.toThrow('Anda bukan pemilik dari comment ini');
    });

    it('should delete comment correctly', async () => {
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

      // adding real comment
      const addedComment = await commentRepositoryPostgres
        .addComment(addCommentPayload, owner, threadId);

      // Action
      await commentRepositoryPostgres.deleteComment(threadId, addedComment.id, owner);

      // Assert
      const deletedComment = await CommentsTableTestHelper.findCommentById(addedComment.id);
      expect(deletedComment[0].id).toStrictEqual(addedComment.id);
      expect(deletedComment[0].content).toStrictEqual('**komentar telah dihapus**');
    });
  });
});
