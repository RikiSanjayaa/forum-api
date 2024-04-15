const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const GettedThread = require('../../../Domains/threads/entities/GettedThread');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockRawThread = {
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: 'some date here',
      username: 'RikiSanjaya',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getComments = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockRawThread));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const gettedThread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(gettedThread).toStrictEqual(new GettedThread({
      ...mockRawThread, comments: [],
    }));
    expect(mockCommentRepository.getComments).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.verifyThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThread).toHaveBeenCalledWith('thread-123');
  });

  it('should return deleted comment correctly', async () => {
    // Arrange
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

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const resolvedComments = await getThreadUseCase._filterDeletedComments(mockRawComments);

    // Assert
    expect(resolvedComments).toStrictEqual([
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
    ]);
  });
});
