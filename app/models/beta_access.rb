class BetaAccess < ApplicationRecord
  before_create :set_defaults

  def set_defaults
    self.code ||= SecureRandom.hex(6)
  end

end
