# frozen_string_literal: true

require 'rails_helper'

describe 'Profile' do
  include ProfileStories

  subject { page }

  let(:local_domain) { ENV['LOCAL_DOMAIN'] }

  before do
    as_a_logged_in_user
    with_alice_as_local_user
  end

  it 'I can view Annes public account' do
    visit account_path('alice')

    is_expected.to have_title("alice (@alice@#{local_domain})")
  end

  it 'I can change my account' do
    visit settings_profile_path

    fill_in 'Display name', with: 'Bob'
    fill_in 'Bio', with: 'Bob is silent'

    first('button[type=submit]').click

    is_expected.to have_content 'Changes successfully saved!'
  end
end
