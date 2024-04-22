class GettedThread {
  constructor(payload) {
    const {
      id, title, body, username, date, comments,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.username = username;
    this.date = date;
    this.comments = comments;
  }
}

module.exports = GettedThread;
