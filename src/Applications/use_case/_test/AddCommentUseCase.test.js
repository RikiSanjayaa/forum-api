const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'a comment',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'a comment',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({ commentRepository: mockCommentRepository });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload, mockAddedComment.owner, 'thread-123');

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: 'a comment',
      owner: 'user-123',
    }));

    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new AddComment({
      content: useCasePayload.content,
    }), mockAddedComment.owner, 'thread-123');
  });
});
