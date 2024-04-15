const GettedThread = require('../GettedThread');

describe('a GettedThread entities', () => {
  it('should create GettedThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      username: 'RikiSanjaya',
      comments: [],
    };

    // Action
    const gettedThread = new GettedThread(payload);

    // Assert
    expect(gettedThread.id).toEqual(payload.id);
    expect(gettedThread.title).toEqual(payload.title);
    expect(gettedThread.body).toEqual(payload.body);
    expect(gettedThread.username).toEqual(payload.username);
    expect(gettedThread.comments).toEqual(payload.comments);
  });
});
