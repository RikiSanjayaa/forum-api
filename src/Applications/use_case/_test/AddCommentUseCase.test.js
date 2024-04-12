const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'a comment',
    };

    const fakeThreadId = 'thread-123';

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'a comment',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository, threadRepository: mockThreadRepository,
    });

    // expected .addComment parameters
    const date = new Date().toISOString();
    const isDeleted = false;

    // Action
    const addedComment = await addCommentUseCase
      .execute(useCasePayload, mockAddedComment.owner, fakeThreadId);

    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);

    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new AddComment({
      content: useCasePayload.content,
    }), mockAddedComment.owner, fakeThreadId, date, isDeleted);
  });
});
