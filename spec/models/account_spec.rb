require 'rails_helper'

RSpec.describe Account, type: :model do
  subject { Fabricate(:account, username: 'alice') }

  context do
    let(:bob) { Fabricate(:account, username: 'bob') }

    describe '#follow!' do
      it 'creates a follow' do
        follow = subject.follow!(bob)

        expect(follow).to be_instance_of Follow
        expect(follow.account).to eq subject
        expect(follow.target_account).to eq bob
      end
    end

    describe '#unfollow!' do
      before do
        subject.follow!(bob)
      end

      it 'destroys a follow' do
        unfollow = subject.unfollow!(bob)

        expect(unfollow).to be_instance_of Follow
        expect(unfollow.account).to eq subject
        expect(unfollow.target_account).to eq bob
        expect(unfollow.destroyed?).to be true
      end
    end

    describe '#following?' do
      it 'returns true when the target is followed' do
        subject.follow!(bob)
        expect(subject.following?(bob)).to be true
      end

      it 'returns false if the target is not followed' do
        expect(subject.following?(bob)).to be false
      end
    end
  end

  describe '#local?' do
    it 'returns true when the account is local' do
      expect(subject.local?).to be true
    end

    it 'returns false when the account is on a different domain' do
      subject.domain = 'foreign.tld'
      expect(subject.local?).to be false
    end
  end

  describe '#acct' do
    it 'returns username for local users' do
      expect(subject.acct).to eql 'alice'
    end

    it 'returns username@domain for foreign users' do
      subject.domain = 'foreign.tld'
      expect(subject.acct).to eql 'alice@foreign.tld'
    end
  end

  describe '#subscribed?' do
    it 'returns false when no secrets and tokens have been set' do
      expect(subject.subscribed?).to be false
    end

    it 'returns true when the secret and token have been set' do
      subject.secret       = 'a'
      subject.verify_token = 'b'

      expect(subject.subscribed?).to be true
    end
  end

  describe '#keypair' do
    it 'returns an RSA key pair' do
      expect(subject.keypair).to be_instance_of OpenSSL::PKey::RSA
    end
  end

  describe '#subscription' do
    it 'returns an OStatus subscription' do
      expect(subject.subscription('')).to be_instance_of OStatus2::Subscription
    end
  end

  describe '#object_type' do
    it 'is always a person' do
      expect(subject.object_type).to be :person
    end
  end

  describe '#title' do
    it 'is the same as the username' do
      expect(subject.title).to eql subject.username
    end
  end

  describe '#content' do
    it 'is the same as the note' do
      expect(subject.content).to eql subject.note
    end
  end
end
