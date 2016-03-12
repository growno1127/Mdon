require 'rails_helper'

RSpec.describe SettingsController, type: :controller do

  before do
    sign_in :user, Fabricate(:user)
  end

  describe "GET #show" do
    it "returns http success" do
      get :show
      expect(response).to have_http_status(:success)
    end
  end

end
