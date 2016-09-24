class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable

  belongs_to :account, inverse_of: :user
  accepts_nested_attributes_for :account

  validates :account, presence: true

  has_many :oauth_applications, class_name: 'Doorkeeper::Application', as: :owner

  scope :prolific, -> { joins('inner join statuses on statuses.account_id = users.account_id').select('users.*, count(statuses.id) as statuses_count').group('users.id').order('statuses_count desc') }
  scope :recent,   -> { order('created_at desc') }

  def admin?
    self.admin
  end
end
