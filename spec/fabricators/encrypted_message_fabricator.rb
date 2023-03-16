# frozen_string_literal: true

Fabricator(:encrypted_message) do
  device
  from_account { Fabricate(:account) }
  from_device_id { Faker::Number.number(digits: 5) }
end
