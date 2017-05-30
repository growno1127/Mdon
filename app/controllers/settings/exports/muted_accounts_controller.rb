# frozen_string_literal: true

module Settings
  module Exports
    class MutedAccountsController < ApplicationController
      include ExportControllerConcern

      def index
        send_export_file
      end

      private

      def export_data
        @export.to_muted_accounts_csv
      end
    end
  end
end
