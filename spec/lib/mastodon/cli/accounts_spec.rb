# frozen_string_literal: true

require 'rails_helper'
require 'mastodon/cli/accounts'

describe Mastodon::CLI::Accounts do
  describe '.exit_on_failure?' do
    it 'returns true' do
      expect(described_class.exit_on_failure?).to be true
    end
  end
end
