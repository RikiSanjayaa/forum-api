const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const GettedThread = require('../../../Domains/threads/entities/GettedThread');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const mockThreadId = 'thread-123';
    const mockComments = [];

    const mockGettedThread = new GettedThread({
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: 'some date here',
      username: 'RikiSanjaya',
      comments: [],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getComments = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGettedThread));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository, commentRepository: mockCommentRepository,
    });

    // Action
    const gettedThread = await getThreadUseCase.execute(mockThreadId, mockComments);

    // Assert
    expect(gettedThread).toStrictEqual(mockGettedThread);
    expect(mockCommentRepository.getComments).toHaveBeenCalledWith(mockThreadId);
    expect(mockThreadRepository.getThread).toHaveBeenCalledWith(mockThreadId, mockComments);
  });
});
