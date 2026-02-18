class AddEmailToAddresses < ActiveRecord::Migration[6.0]
  class MigrationAddress < ActiveRecord::Base
    self.table_name = "addresses"
  end

  def up
    add_column :addresses, :email, :string

    MigrationAddress.reset_column_information
    MigrationAddress.find_each do |address|
      fallback = "sin-email-#{address.id}@example.cl"
      address.update_columns(email: fallback)
    end

    change_column_null :addresses, :email, false
    add_index :addresses, :email
  end

  def down
    remove_index :addresses, :email
    remove_column :addresses, :email
  end
end
