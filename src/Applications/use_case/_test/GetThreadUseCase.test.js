const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const GettedThread = require('../../../Domains/threads/entities/GettedThread');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const mockThreadId = 'thread-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({ threadRepository: mockThreadRepository });

    // Action
    const gettedThread = await getThreadUseCase.execute(mockThreadId);

    // Assert
    expect(mockThreadRepository.getThread).toHaveBeenCalledWith(mockThreadId);
  });
});
