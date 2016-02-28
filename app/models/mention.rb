class Mention < ActiveRecord::Base
  belongs_to :account, inverse_of: :mentions
  belongs_to :status

  validates :account, :status, presence: true
  validates :account, uniqueness: { scope: :status }
end
