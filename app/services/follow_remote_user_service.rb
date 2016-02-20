class FollowRemoteUserService
  include GrapeRouteHelpers::NamedRouteMatcher

  def call(user)
    username, domain = user.split('@')
    account = Account.where(username: username, domain: domain).first

    return account unless account.nil?

    account = Account.new(username: username, domain: domain)
    data    = Goldfinger.finger("acct:#{user}")

    account.remote_url  = data.link('http://schemas.google.com/g/2010#updates-from').href
    account.salmon_url  = data.link('salmon').href
    account.public_key  = magic_key_to_pem(data.link('magic-public-key').href)
    account.private_key = nil

    account.secret       = SecureRandom.hex
    account.verify_token = SecureRandom.hex

    feed = get_feed(account.remote_url)
    hubs = feed.xpath('//xmlns:link[@rel="hub"]')

    return false if hubs.empty? || hubs.first.attribute('href').nil?

    account.hub_url = hubs.first.attribute('href').value
    account.save!

    subscription = account.subscription(subscription_url(account))
    subscription.subscribe
  rescue Goldfinger::Error, HTTP::Error => e
    false
  end

  private

  def get_feed(url)
    response = http_client.get(Addressable::URI.parse(url))
    Nokogiri::XML(response)
  end

  def magic_key_to_pem(magic_key)
    _, modulus, exponent = magic_key.split('.')
    modulus, exponent = [modulus, exponent].map { |n| Base64.urlsafe_decode64(n).bytes.inject(0) { |num, byte| (num << 8) | byte } }

    key   = OpenSSL::PKey::RSA.new
    key.n = modulus
    key.d = exponent

    key.to_pem
  end

  def http_client
    HTTP
  end

  def subscription_url(account)
    "https://649841dc.ngrok.io/api#{subscriptions_path(id: account.id)}"
  end
end
