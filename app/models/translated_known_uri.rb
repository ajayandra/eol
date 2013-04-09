# The translation for KnownUri (q.v.).  Note that I'm not enforcing the name to be unique. We could, in theory, have
# multiple URIs that all "mean" the same thing. In reality, all of them but the one we prefer should be hidden... but
# hey.
class TranslatedKnownUri < ActiveRecord::Base

  belongs_to :known_uri
  belongs_to :language

  attr_accessible :name

  validates_presence_of :name

end
