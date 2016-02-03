module EOL
  module Api
    module Traits
      class V1_0 < EOL::Api::MethodVersion
        VERSION = '1.0'
        BRIEF_DESCRIPTION = ""
        DESCRIPTION = ""
        PARAMETERS = Proc.new {
          [
            EOL::Api::DocumentationParameter.new(
              :name => 'id',
              :type => Integer,
              :required => true)
          ] }

        def self.call(params={})
          validate_and_normalize_input_parameters!(params)
          JSON.pretty_generate(PageTraits.new(taxon_concept).jsonld)
        end
      end
    end
  end
end
