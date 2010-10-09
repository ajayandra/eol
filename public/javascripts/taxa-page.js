if (!EOL) EOL = {};
if (!EOL.change_toc) EOL.change_toc = function(new_id) {
  $('#toc a.toc_item').removeClass('active');
  $('#toc a#category_id_'+new_id).addClass('active');
  $('#new_text_toc_text').attr('href', $('#new_text_toc_text').attr('href').replace(/toc_id=\d+/, 'toc_id='+new_id));
  $('select#data_objects_toc_category_toc_id').val(new_id);
  $('#center-page-content').css({height:'auto'});
  try {
    EOL.rating.init_links('');
  } catch(err) {}
};

$(document).ready(function() {
  // TODO - move to its own js (for maps view)
  // clicking map will show its attributions
  $('img#map').click(function (e) {
    $('map_attributions').click();
  });
  
  // when clicking on any tab in the media center - replace the pane DIV with the response
  $('#tab_media_center a').click(function() {
      $.ajax({
        url: $(this).attr('href'),
        success: function(response) {$('div.tab-panes').html(response);},
        error: function(request) {$('div.tab-panes').html('<p>Sorry, there was an error.</p>');}
      });
      return false;
  });
  
  // Change TOC item:
  $('#toc a.toc_item').click(function() {
    id = $(this).attr('id').replace(/\D+/, '');
    $.ajax({
      url: $(this).attr('href'),
      success: function(response) {
        $('#center-page-content').html(response);
        updateReferences();
        EOL.change_toc(id);
      },
      error: function(request) {$('#center-page-content').html('<p>Sorry, there was an error.</p>');}
    });
    return false;
  });
  // Contribution section popups:
  $('ul#contribute a.show_popup').click(function() {
    $.ajax({
      url: $(this).attr('href'),
      complete: function(request) {$('#contribute-info').slideDown();},
      success: function(result) {$('#contribute-info').html(result);},
      error: function() {$('#contribute-info').html('<p>Sorry, there was an error.</p>');}
    });
    return false;
  });
});

// Displays the Photosynth interface in the image pane.
function load_photosynth_interface(source_url) {
  // TODO - put this in the view, and just show/hide it.  We don't want HTML here.  ...A bit tricky, because we're using
  // jQuery Tools tabs, here, so if we put in an "extra" div for this, will it behave correctly?  Not sure.  Also, note I
  // changed the id on the table to a class (of the same name).  Same with main-image-bg!
  synth = "<table id='main-image-table'><tr><td><iframe frameborder='0' src='" + source_url.replace("view.aspx", "embed.aspx") + "&delayLoad=true&slideShowPlaying=false' width='425' height='355'></iframe><img id='main-image'></td></tr></table>";
  $('#main-image-bg').html = synth;  
}

// Show some spinners when we're doing stuff:
$('#ajax-indicator').ajaxStart(function() {
  $(this).show();
});
$('#center-page-content-loading').ajaxStart(function() {
  $(this).show();
});
$('#ajax-indicator').ajaxComplete(function() {
  $(this).hide();
});
$('#center-page-content-loading').ajaxComplete(function() {
  $(this).hide();
});
