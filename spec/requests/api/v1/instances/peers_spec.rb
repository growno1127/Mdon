# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Peers' do
  describe 'GET /api/v1/instance/peers' do
    around do |example|
      original = Setting.peers_api_enabled
      example.run
      Setting.peers_api_enabled = original
    end

    context 'with peers api enabled' do
      before { Setting.peers_api_enabled = true }

      it 'returns http success' do
        get api_v1_instance_peers_path

        expect(response)
          .to have_http_status(200)

        expect(body_as_json)
          .to be_an(Array)
      end
    end

    context 'with peers api diabled' do
      before { Setting.peers_api_enabled = false }

      it 'returns http not found' do
        get api_v1_instance_peers_path

        expect(response)
          .to have_http_status(404)
      end
    end
  end
end
