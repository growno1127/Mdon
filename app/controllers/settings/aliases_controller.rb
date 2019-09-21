# frozen_string_literal: true

class Settings::AliasesController < Settings::BaseController
  layout 'admin'

  before_action :authenticate_user!
  before_action :set_aliases, except: :destroy
  before_action :set_alias, only: :destroy

  def index
    @alias = current_account.aliases.build
  end

  def create
    @alias = current_account.aliases.build(resource_params)

    if @alias.save
      redirect_to settings_aliases_path, notice: I18n.t('aliases.created_msg')
    else
      render :index
    end
  end

  def destroy
    @alias.destroy!
    redirect_to settings_aliases_path, notice: I18n.t('aliases.deleted_msg')
  end

  private

  def resource_params
    params.require(:account_alias).permit(:acct)
  end

  def set_alias
    @alias = current_account.aliases.find(params[:id])
  end

  def set_aliases
    @aliases = current_account.aliases.order(id: :desc).reject(&:new_record?)
  end
end
