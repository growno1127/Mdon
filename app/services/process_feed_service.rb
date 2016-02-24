class ProcessFeedService < BaseService
  # Create local statuses from an Atom feed
  # @param [String] body Atom feed
  # @param [Account] account Account this feed belongs to
  def call(body, account)
    xml = Nokogiri::XML(body)

    xml.xpath('//xmlns:entry').each do |entry|
      next unless [:note, :comment, :activity].includes? object_type(entry)

      status = Status.find_by(uri: activity_id(entry))

      next unless status.nil?

      status = Status.new(uri: activity_id(entry), account: account, text: content(entry), created_at: published(entry), updated_at: updated(entry))

      if object_type(entry) == :comment
        add_reply!(entry, status)
      elsif verb(entry) == :share
        add_reblog!(entry, status)
      else
        add_post!(entry, status)
      end

      process_mentions_service.(status) unless status.new_record?
    end
  end

  private

  def add_post!(entry, status)
    status.save!
  end

  def add_reblog!(entry, status)
    status.reblog = find_original_status(entry, target_id(entry))

    if status.reblog.nil?
      status.reblog = fetch_remote_status(entry)
    end

    status.save! unless status.reblog.nil?
  end

  def add_reply!(entry, status)
    status.thread = find_original_status(entry, thread_id(entry))
    status.save!
  end

  def find_original_status(xml, id)
    return nil if id.nil?

    if local_id?(id)
      Status.find(unique_tag_to_local_id(id, 'Status'))
    else
      Status.find_by(uri: id)
    end
  end

  def fetch_remote_status(xml)
    username = xml.at_xpath('./activity:object/xmlns:author/xmlns:name').content
    url      = xml.at_xpath('./activity:object/xmlns:author/xmlns:uri').content
    domain   = Addressable::URI.parse(url).host
    account  = Account.find_by(username: username, domain: domain)

    if account.nil?
      account = follow_remote_account_service.("acct:#{username}@#{domain}", false)
      return nil if account.nil?
    end

    Status.new(account: account, uri: target_id(xml), text: target_content(xml), url: target_url(xml))
  end

  def published(xml)
    xml.at_xpath('./xmlns:published').content
  end

  def updated(xml)
    xml.at_xpath('./xmlns:updated').content
  end

  def content(xml)
    xml.at_xpath('./xmlns:content').content
  end

  def thread_id(xml)
    xml.at_xpath('./thr:in-reply-to-id').attribute('ref').value
  rescue
    nil
  end

  def target_id(xml)
    xml.at_xpath('.//activity:object/xmlns:id').content
  rescue
    nil
  end

  def activity_id(xml)
    entry.at_xpath('./xmlns:id').content
  end

  def target_content(xml)
    xml.at_xpath('.//activity:object/xmlns:content').content
  end

  def target_url(xml)
    xml.at_xpath('.//activity:object/xmlns:link[@rel=alternate]').attribute('href').value
  end

  def object_type(xml)
    xml.at_xpath('./activity:object-type').content.gsub('http://activitystrea.ms/schema/1.0/', '').to_sym
  rescue
    :note
  end

  def verb(xml)
    xml.at_xpath('./activity:verb').content.gsub('http://activitystrea.ms/schema/1.0/', '').to_sym
  rescue
    :post
  end

  def follow_remote_account_service
    @follow_remote_account_service ||= FollowRemoteAccountService.new
  end

  def process_mentions_service
    @process_mentions_service ||= ProcessMentionsService.new
  end
end
