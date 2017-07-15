# frozen_string_literal: true

class SendInteractionService < BaseService
  # Send an Atom representation of an interaction to a remote Salmon endpoint
  # @param [String] Entry XML
  # @param [Account] source_account
  # @param [Account] target_account
  def call(xml, source_account, target_account)
    @xml            = xml
    @source_account = source_account
    @target_account = target_account

    return if block_notification?

    delivery = build_request.perform

    raise "Delivery failed for #{target_account.salmon_url}: HTTP #{delivery.code}" unless delivery.code > 199 && delivery.code < 300
  end

  private

  def build_request
    request = Request.new(:post, @target_account.salmon_url, body: envelope)
    request.add_headers('Content-Type' => 'application/magic-envelope+xml')
    request
  end

  def envelope
    salmon.pack(@xml, @source_account.keypair)
  end

  def block_notification?
    DomainBlock.blocked?(@target_account.domain)
  end

  def salmon
    @salmon ||= OStatus2::Salmon.new
  end
end
