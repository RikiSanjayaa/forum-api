const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner) {
    const addThreadPayload = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThreadPayload, owner);
  }
}

module.exports = AddThreadUseCase;
