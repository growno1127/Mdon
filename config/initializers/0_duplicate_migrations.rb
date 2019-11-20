# Some migrations have been present in glitch-soc for a long time and have then
# been merged in upstream Mastodon, under a different version number.
#
# This puts us in an uneasy situation in which if we remove upstream's
# migration file, people migrating from upstream will end up having a conflict
# with their already-ran migration.
#
# On the other hand, if we keep upstream's migration and remove our own,
# any current glitch-soc user will have a conflict during migration.
#
# For lack of a better solution, as those migrations are indeed identical,
# we decided monkey-patching Rails' Migrator to completely ignore the duplicate,
# keeping only the one that has run, or an arbitrary one.

ALLOWED_DUPLICATES = [20180410220657, 20180831171112].freeze

module ActiveRecord
  class Migrator
    old_initialize = instance_method(:initialize)

    define_method(:initialize) do |direction, migrations, target_version|
      migrated = Set.new(Base.connection.migration_context.get_all_versions)

      migrations.group_by(&:name).each do |name, duplicates|
        if duplicates.length > 1 && duplicates.all? { |m| ALLOWED_DUPLICATES.include?(m.version) }
          # We have a set of allowed duplicates. Keep the migrated one, if any.
          non_migrated = duplicates.reject { |m| migrated.include?(m.version.to_i) }

          if duplicates.length == non_migrated.length
            # There weren't any migrated one, so we have to pick one “canonical” migration
            migrations = migrations - duplicates[1..-1]
          else
            # Just reject every duplicate which hasn't been migrated yet
            migrations = migrations - non_migrated
          end
        end
      end

      old_initialize.bind(self).(direction, migrations, target_version)
    end
  end
end
