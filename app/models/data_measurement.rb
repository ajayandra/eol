class DataMeasurement < StructuredData

  CLASS_URI = 'http://rs.tdwg.org/dwc/terms/MeasurementOrFact'

  def initialize(options={})
    raise 'Predicate must be a URI' unless EOL::Sparql.is_uri?(options[:predicate])
    super
    @metadata['dwc:measurementUnit'] = options[:unit] if options[:unit]
    @uri = @graph_name + "/measurements/" + @unique_id
  end

  def turtle
    "<#{@uri}> a <#{CLASS_URI}>" +
    "; dwc:taxonID <#{@taxon_uri}>" +
    "; dwc:measurementType " + EOL::Sparql.enclose_value(@predicate) +
    "; dwc:measurementValue " + EOL::Sparql.enclose_value(@object) +
    @metadata.collect{ |a,v| "; " + EOL::Sparql.enclose_value(a) + " " + EOL::Sparql.enclose_value(v) }.join(" ")
  end
end
