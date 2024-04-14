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
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGettedThread));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const gettedThread = await getThreadUseCase.execute(mockThreadId);

    // Assert
    expect(gettedThread).toStrictEqual(mockGettedThread);
    expect(mockCommentRepository.getComments).toHaveBeenCalledWith(mockThreadId);
    expect(mockThreadRepository.getThread).toHaveBeenCalledWith(mockThreadId);
  });

  it('should return deleted comment correctly', async () => {
    // Arrange
    const mockThreadId = 'thread-123';
    const mockRawComments = [
      {
        id: 'comment-123',
        username: 'RikiSanjaya',
        date: '2024',
        content: 'sebuah comment',
        is_deleted: true,
      },
      {
        id: 'comment-124',
        username: 'RikiSanjaya',
        date: '2024',
        content: 'sebuah comment',
        is_deleted: false,
      },
    ];
    const mockResolvedComments = [
      {
        id: 'comment-123',
        username: 'RikiSanjaya',
        date: '2024',
        content: '**komentar telah dihapus**',
      },
      {
        id: 'comment-124',
        username: 'RikiSanjaya',
        date: '2024',
        content: 'sebuah comment',
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getComments = jest.fn()
      .mockImplementation(() => Promise.resolve(mockRawComments));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const resolvedComments = await getThreadUseCase._filterDeletedComments(mockRawComments);

    // Assert
    expect(resolvedComments).toStrictEqual(mockResolvedComments);
  });
});
