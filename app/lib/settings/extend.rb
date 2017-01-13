module Settings
  module Extend
  	extend ActiveSupport::Concern

    def settings
      ScopedSettings.for_thing(self)
    end
  end
end