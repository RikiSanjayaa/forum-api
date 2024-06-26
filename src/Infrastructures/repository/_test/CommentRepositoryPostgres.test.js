const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('getComments function', () => {
    it('should return comments with the same thread id as foreign key', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const getComment = await CommentsTableTestHelper.findCommentById('comment-123');
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getComments('thread-123');

      // Assert
      expect(comments).toStrictEqual([
        {
          id: 'comment-123',
          content: 'a comment',
          username: 'dicoding',
          is_deleted: false,
          date: getComment[0].date,
        },
      ]);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError if commentId is not found', async () => {
      // Arrange
      const fakeCommentId = 'xxx';
      const owner = 'user-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(fakeCommentId, owner))
        .rejects.toThrow('Comment tidak ditemukan');
    });

    it('should throw AuthorizationError if Comment owner != current user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comments-123', owner: 'user-123', threadId: 'thread-123',
      });

      const fakeOwner = 'user-1234';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comments-123', fakeOwner))
        .rejects.toThrowError(AuthorizationError);
    });
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const addCommentPayload = new AddComment({
        content: 'a comment',
      });
      const fakeIdGenerator = () => '123'; // stub
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const owner = 'user-123';
      const threadId = 'thread-123';
      const isDeleted = false;
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres
        .addComment(addCommentPayload, owner, threadId, isDeleted);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
      expect(comment[0].content).toStrictEqual(addCommentPayload.content);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'a comment',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should delete comment correctly', async () => {
      // Arrange
      const addCommentPayload = new AddComment({
        content: 'a comment',
      });
      const fakeIdGenerator = () => '123'; // stub
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // adding real comment
      const addedComment = await commentRepositoryPostgres
        .addComment(addCommentPayload, owner, threadId, false);

      // Action
      await commentRepositoryPostgres.deleteComment(addedComment.id, owner);

      // Assert
      const deletedComment = await commentRepositoryPostgres.getComments(threadId);
      expect(deletedComment).toHaveLength(1);
      expect(deletedComment[0].id).toStrictEqual(addedComment.id);
      expect(deletedComment[0].is_deleted).toBeTruthy();
    });
  });
});
