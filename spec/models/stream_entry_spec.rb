require 'rails_helper'

RSpec.describe StreamEntry, type: :model do
  let(:alice)     { Fabricate(:account, username: 'alice') }
  let(:bob)       { Fabricate(:account, username: 'bob') }
  let(:follow)    { Fabricate(:follow, account: alice, target_account: bob) }
  let(:status)    { Fabricate(:status, account: alice) }
  let(:reblog)    { Fabricate(:status, account: bob, reblog: status) }
  let(:reply)     { Fabricate(:status, account: bob, thread: status) }
  let(:favourite) { Fabricate(:favourite, account: alice, status: status) }

  describe '#targeted?' do
    it 'returns true for a follow' do
      expect(follow.stream_entry.targeted?).to be true
    end

    it 'returns true for a favourite' do
      expect(favourite.stream_entry.targeted?).to be true
    end

    it 'returns true for a reblog' do
      expect(reblog.stream_entry.targeted?).to be true
    end

    it 'returns false otherwise' do
      expect(status.stream_entry.targeted?).to be false
    end
  end

  describe '#threaded?' do
    it 'returns true for a favourite' do
      expect(favourite.stream_entry.threaded?).to be true
    end

    it 'returns true for a reply' do
      expect(reply.stream_entry.threaded?).to be true
    end

    it 'returns false otherwise' do
      expect(status.stream_entry.threaded?).to be false
    end
  end
end
