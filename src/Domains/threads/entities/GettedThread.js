class GettedThread {
  constructor(payload) {
    const {
      id, title, body, username, comments,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.username = username;
    this.comments = comments;
  }
}

module.exports = GettedThread;
