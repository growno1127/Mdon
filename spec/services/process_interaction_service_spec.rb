require 'rails_helper'

RSpec.describe ProcessInteractionService do
  let(:receiver) { Fabricate(:user, email: 'alice@example.com', account: Fabricate(:account, username: 'alice')).account }
  let(:sender)   { Fabricate(:user, email: 'bob@example.com', account: Fabricate(:account, username: 'bob')).account }

  subject { ProcessInteractionService.new }

  describe 'follow request slap' do
    before do
      receiver.update(locked: true)

      payload = <<XML
<entry xmlns="http://www.w3.org/2005/Atom" xmlns:activity="http://activitystrea.ms/spec/1.0/">
  <author>
    <name>bob</name>
    <uri>https://cb6e6126.ngrok.io/users/bob</uri>
  </author>

  <id>someIdHere</id>
  <activity:verb>http://activitystrea.ms/schema/1.0/request-friend</activity:verb>
</entry>
XML

      envelope = OStatus2::Salmon.new.pack(payload, sender.keypair)
      subject.call(envelope, receiver)
    end

    it 'creates a record' do
      expect(FollowRequest.find_by(account: sender, target_account: receiver)).to_not be_nil
    end
  end

  describe 'follow request authorization slap' do
    before do
      receiver.update(locked: true)
      FollowRequest.create(account: sender, target_account: receiver)

      payload = <<XML
<entry xmlns="http://www.w3.org/2005/Atom" xmlns:activity="http://activitystrea.ms/spec/1.0/">
  <author>
    <name>alice</name>
    <uri>https://cb6e6126.ngrok.io/users/alice</uri>
  </author>

  <id>someIdHere</id>
  <activity:verb>http://activitystrea.ms/schema/1.0/authorize</activity:verb>
</entry>
XML

      envelope = OStatus2::Salmon.new.pack(payload, receiver.keypair)
      subject.call(envelope, sender)
    end

    it 'creates a follow relationship' do
      expect(Follow.find_by(account: sender, target_account: receiver)).to_not be_nil
    end

    it 'removes the follow request' do
      expect(FollowRequest.find_by(account: sender, target_account: receiver)).to be_nil
    end
  end

  describe 'follow request rejection slap' do
    before do
      receiver.update(locked: true)
      FollowRequest.create(account: sender, target_account: receiver)

      payload = <<XML
<entry xmlns="http://www.w3.org/2005/Atom" xmlns:activity="http://activitystrea.ms/spec/1.0/">
  <author>
    <name>alice</name>
    <uri>https://cb6e6126.ngrok.io/users/alice</uri>
  </author>

  <id>someIdHere</id>
  <activity:verb>http://activitystrea.ms/schema/1.0/reject</activity:verb>
</entry>
XML

      envelope = OStatus2::Salmon.new.pack(payload, receiver.keypair)
      subject.call(envelope, sender)
    end

    it 'does not create a follow relationship' do
      expect(Follow.find_by(account: sender, target_account: receiver)).to be_nil
    end

    it 'removes the follow request' do
      expect(FollowRequest.find_by(account: sender, target_account: receiver)).to be_nil
    end
  end
end
