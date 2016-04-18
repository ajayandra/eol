# An ancestry tree for hierarchy entries. It's a bit absurd to me that
# hierarchy_id isn't in the fields. It's also crazy that we don't index
# individual fields (just the PK, which is the combo)... but so far, things
# aren't _that_ slow, so we perservere.
class HierarchyEntriesFlattened < ActiveRecord::Base
  self.table_name = "hierarchy_entries_flattened"
  self.primary_keys = :hierarchy_entry_id, :ancestor_id

  belongs_to :hierarchy_entry, class_name: HierarchyEntry.to_s, foreign_key: :hierarchy_entry_id
  belongs_to :ancestor, class_name: HierarchyEntry.to_s, foreign_key: :ancestor_id

  class << self
    # NOTE: This is very, very, VERY slow. It's using the PK, so that's not the
    # problem... It's just that deletes are very slow. Don't call this. Seriously.
    # You probably want to create a diff and delete only the things you need to.
    def delete_hierarchy_id(hierarchy_id)
      EOL.log_call
      ids = in_hierarchy(hierarchy_id).
        map { |r| "(#{r.hierarchy_entry_id}, #{r.ancestor_id})" }
      return if ids.empty?
      ids.in_groups_of(6400, false) do |set|
        delete_set(set)
      end
    end

    def delete_set(id_pairs)
      return if id_pairs.empty?
      ids_array = id_pairs.to_a
      ids_array.in_groups_of(1000, false) do |group|
        where("(hierarchy_entry_id, ancestor_id) IN (#{group.join(",")})").
          delete_all
      end
    end

    def pks_in_hierarchy(hierarchy)
      pks = Set.new
      ids = hierarchy.hierarchy_entries.pluck(:id)
      num = 0
      done = 0
      ids.in_groups_of(10_000).each do |group|
        EOL.log("Group #{num += 1} (#{done += group.size}/#{ids.size})") if
          ids.size > 10_000
        # NOTE: This was going REALLY (!!!) slow, so I am skipping it for now:
        # pks += EOL.pluck_pks(self, where(hierarchy_entry_id: group))
        pks += where(hierarchy_entry_id: group).map do |hef|
          "#{hef.hierarchy_entry_id},#{hef.ancestor_id}"
        end
      end
      pks
    end

    # scope :in_hierarchy, ->(hierarchy_id) { where("(hierarchy_entry_id, "\
    #   "ancestor_id) IN (#{in_hierarchy_pks(hierarchy_id).to_sql})") }
      # where("product_id IN (#{select("product_id").joins(:artist).where("artist.is_disabled = TRUE").to_sql})")

    # NOTE: this does NOT "cascade": all of these descendants will be aware of
    # THIS node, but NOT about all interceding nodes. i.e., if you run this on
    # "Animalia", then "Carnivora" will know "Animalia" is an ancestor, and
    # "Procyon" will know that "Animalia" is an ancestor, but THIS command will
    # NOT make "Procyon" know that "Carnivora" is an ancestor!  You have been
    # warned. On the positive side, this command is actually pretty dern fast, all
    # things considered. ...Had to use raw SQL here, though, to get the
    # performance. :\
    def repopulate(entry)
      EOL::Db.delete_all_batched(HierarchyEntriesFlattened,
        ["ancestor_id = ?", entry.id])
      with_master do
        connection.execute(
          "INSERT INTO #{table_name} "\
          "(hierarchy_entry_id, ancestor_id) "\
          "SELECT hierarchy_entries.id, #{entry.id} "\
          "FROM hierarchy_entries "\
          "WHERE lft BETWEEN #{entry.lft} + 1 AND #{entry.rgt} AND "\
          "hierarchy_id = #{entry.hierarchy_id}")
      end
    end

    # A TEMPORARY table is visible only to the current session, and is dropped
    # automatically when the session is closed. This means that two different
    # sessions can use the same temporary table name without conflicting with each
    # other or with an existing non-TEMPORARY table of the same name.
    # http://dev.mysql.com/doc/refman/5.1/en/create-table.html
    def tmp_table
      "TEMP_hierarchy_entries_flattened"
    end

    def create_tmp
      drop_tmp
      connection.execute("CREATE TEMPORARY TABLE #{tmp_table} "\
        "SELECT * FROM #{table_name} WHERE 1=0")
    end

    def drop_tmp
      connection.execute("DROP TEMPORARY TABLE IF EXISTS #{tmp_table}")
    end
  end

  # TODO: This should really be an aliased attribute (I think), but I'm in a rush.
  def flat_ancestor
    ancestor
  end
end
