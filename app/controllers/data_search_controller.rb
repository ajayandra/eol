#encoding: utf-8

class DataSearchController < ApplicationController

  include ActionView::Helpers::TextHelper

  before_filter :restrict_to_data_viewers
  before_filter :allow_login_then_submit, only: :download

  layout 'data_search'
  # TODO - optionally but preferentially pass in a known_uri_id (when we have it), to avoid the ugly URL
  def index
    EOL.log_call
    @page_title = I18n.t('data_search.page_title')
    prepare_search_parameters(params)
    prepare_attribute_options
    prepare_suggested_searches
    respond_to do |format|
      format.html do
        @traits = SearchTraits.new(@search_options)
      end
    end
  end

  def update_attributes
    prepare_attribute_options
    respond_to do |format|
      format.html {}
      format.js {}
    end
  end

  def download
    if session[:submitted_data]
      search_params = session.delete(:submitted_data)
    else
      search_params = params.dup
    end
    prepare_search_parameters(search_params)
    total_results = EOL::Sparql.connection.query(EOL::Sparql::SearchQueryBuilder.prepare_search_query(@search_options.merge(only_count: true))).first[:count].to_i
    #create all download files
    no_of_files = (total_results.to_f / DataSearchFile::LIMIT).ceil
    for count in 1..no_of_files
      df = create_data_search_file
      df.update_attributes(file_number: count)
      Resque.enqueue(DataFileMaker, data_file_id: df.id)
    end
    flash[:notice] = I18n.t(:file_download_pending, link: user_data_downloads_path(current_user.id))
    redirect_to user_data_downloads_path(current_user.id)
  end

  private

  def get_equivalents(uri)
    uri = KnownUri.by_uri(uri)
    uri ? uri.equivalent_known_uris : []
  end

  def create_data_search_file
    file = DataSearchFile.create!(@data_search_file_options)
    unless @required_equivalent_attributes.blank?
      @required_equivalent_attributes.each do |eq|
        DataSearchFileEquivalent.create(data_search_file_id: file.id, uri_id: eq.to_i, is_attribute: true)
      end
    end
    unless @required_equivalent_values.blank?
      @required_equivalent_values.each do |eq|
        DataSearchFileEquivalent.create(data_search_file_id: file.id, uri_id: eq.to_i, is_attribute: false)
      end
    end
    file
  end

  # NOTE: this takes a LONG (!) time! Can take 20 seconds!  Why?! TODO
  def prepare_search_parameters(options)
    EOL.log_call
    @hide_global_search = true
    @querystring_uri = nil
    @querystring = options[:q]
    @querystring_uri = @querystring if EOL::Sparql.is_uri?(@querystring)
    @attribute = options[:attribute]
    @attribute_missing = @attribute.nil? && params.has_key?(:attribute)
    @sort = (options[:sort] && [ 'asc', 'desc' ].include?(options[:sort])) ? options[:sort] : 'desc'
    @unit = options[:unit].blank? ? nil : options[:unit]
    @min_value = (options[:min] && options[:min].is_numeric?) ? options[:min].to_f : nil
    @max_value = (options[:max] && options[:max].is_numeric?) ? options[:max].to_f : nil
    @min_value,@max_value = @max_value,@min_value if @min_value && @max_value && @min_value > @max_value
    @page = options[:page].try(:to_i) || 1
    # TODO: someday we might want to use a page size...
    @offset = (@page - 1) * 100 + 1
    @required_equivalent_attributes = params[:required_equivalent_attributes]
    @required_equivalent_values = !options[:q].blank? ?  params[:required_equivalent_values] : nil
    EOL.log("get equivs", prefix: ".")
    @equivalent_attributes = get_equivalents(@attribute)
    equivalent_attributes_ids = @equivalent_attributes.map{|eq| eq.id.to_s}
    # check if it is really an equivalent attribute
    @required_equivalent_attributes = @required_equivalent_attributes.map{|eq| eq if equivalent_attributes_ids.include?(eq) }.compact if @required_equivalent_attributes

    if ! options[:q].blank?
      EOL.log("handle q", prefix: ".")
      tku = TranslatedKnownUri.find_by_name(@querystring)
      ku = tku.known_uri if tku
      if ku
        @equivalent_values = get_equivalents(ku.uri)
        equivalent_values_ids = @equivalent_values.map{|eq| eq.id.to_s}
        @required_equivalent_values = @required_equivalent_values.map{|eq| eq if equivalent_values_ids.include?(eq) }.compact if @required_equivalent_values
      end
    end

    #if entered taxon name returns more than one result choose first
    if options[:taxon_concept_id].blank? && !(options[:taxon_name].blank?)
      EOL.log("simple taxon search", prefix: ".")
      results_with_suggestions = EOL::Solr::SiteSearch.simple_taxon_search(options[:taxon_name], language: current_language)
      results = results_with_suggestions[:results]
      if !(results.blank?)
        @taxon_concept = results[0]['instance']
      end
    end

    @taxon_concept ||= TaxonConcept.find_by_id(options[:taxon_concept_id])
    # Look up attribute based on query
    unless @querystring.blank?
      EOL.log("lookup uri based on query", prefix: ".")
      @attribute_known_uri = KnownUri.by_name(@querystring).first
      if @attribute_known_uri
        @attribute = @attribute_known_uri.uri
        @querystring = options[:q] = ''
      end
    else
      EOL.log("lookup uri", prefix: ".")
      @attribute_known_uri = KnownUri.by_uri(@attribute)
    end
    @attributes = @attribute_known_uri ? @attribute_known_uri.label : @attribute
    if @required_equivalent_attributes
      @required_equivalent_attributes.each do |attr|
        @attributes += " + #{KnownUri.find(attr.to_i).label}"
      end
    end

    #@values = @querystring.to_s
    EOL.log("querystring uri", prefix: ".")
    if @querystring_uri
      known_uri = KnownUri.by_uri(@querystring_uri)
      @values = known_uri.label if known_uri
    else
      @values = @querystring.to_s
    end
    if @required_equivalent_values
      @required_equivalent_values.each do |val|
        @values += " + #{KnownUri.find(val.to_i).label}"
      end
    end

    EOL.log("attribute known uri", prefix: ".")
    if @attribute_known_uri && ! @attribute_known_uri.units_for_form_select.empty?
      @units_for_select = @attribute_known_uri.units_for_form_select
    else
      @units_for_select = KnownUri.default_units_for_form_select
    end
    # NOTE: Offset in controller starts at 1 (TODO: why?), so I correct:
    @search_options = { querystring: @querystring, attribute: @attribute,
      min_value: @min_value, max_value: @max_value, page: @page,
      offset: @offset - 1, unit: @unit, sort: @sort,
      clade: @taxon_concept ? @taxon_concept.id : nil,
      required_equivalent_attributes: @required_equivalent_attributes,
      required_equivalent_values: @required_equivalent_values }
    @data_search_file_options = { q: @querystring, uri: @attribute,
      from: @min_value, to: @max_value,
      sort: @sort, known_uri: @attribute_known_uri, language: current_language,
      user: current_user,
      taxon_concept_id: (@taxon_concept ? @taxon_concept.id : nil),
      unit_uri: @unit }
    EOL.log("exiting #prepare_search_parameters", prefix: ".")
  end

  # TODO - this should be In the DB with an admin/master curator UI behind it. I
  # would also add a "comment" to that model, when we build it, which would
  # populate a flash message after the search is run; that would allow things
  # like "notice how this search specifies a URI as the query" and the like,
  # calling out specific features of each search.
  #
  # That said, we will have to consider how to deal with I18n, both for the
  # "comment" and for the label.
  def prepare_suggested_searches
    EOL.log_call
    @suggested_searches = [
      # { label_key: 'search_suggestion_whale_mass',
      #   params: {
      #     sort: 'desc',
      #     min: 10000,
      #     taxon_concept_id: 7649,
      #     attribute: 'http://purl.obolibrary.org/obo/VT_0001259',
      #     unit: 'http://purl.obolibrary.org/obo/UO_0000009' }},
      { label_key: 'search_suggestion_cavity_nests',
        params: {
          q: 'cavity',
          attribute: 'http://eol.org/schema/terms/NestType' }},
      { label_key: 'search_suggestion_diatom_shape',
        params: {
          attribute: 'http://purl.obolibrary.org/obo/OBA_0000052',
          taxon_concept_id: 3685 }},
      { label_key: 'search_suggestion_blue_flowers',
        params: {
          q: 'http://purl.obolibrary.org/obo/PATO_0000318',
          attribute: 'http://purl.obolibrary.org/obo/TO_0000537' }}
    ]
  end

  # TODO: the format of @attribute_options is plain stupid. Simplify and change
  # the view.
  def prepare_attribute_options
    EOL.log_call
    # TODO: attributes within clades (only)
    # TODO: this is sloppy, refactor.
    @attribute_options = TraitBank.predicates.map do |array|
      (id, uri, name) = array
      [ truncate(name, length: 30), uri, { 'data-known_uri_id' => id } ]
    end
  end

  # Add an entry to the database recording the number of results and time of search operation
  def log_data_search(options = {})
    # We are logging when there is only a TaxonConceptID - that will occur if a users clicks on a search
    # link from the data tab on a taxon page. In that case, a search is NOT performed, but we are
    # creating a log to capture the time it takes to populate the attribute list.
    # For every log which has an attribute, a search WILL have been performed
    if params[:attribute] || params[:taxon_concept_id]
      DataSearchLog.create(
        @data_search_file_options.merge({
          clade_was_ignored: false,
          user_id: ( logged_in? ? current_user.id : nil ),
          number_of_results: @results.total_entries,
          time_in_seconds: options[:time_in_seconds],
          ip_address: request.remote_ip
        })
      )
    end
  end


end
