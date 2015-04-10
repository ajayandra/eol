function lookup_concept(t){lookup_id(t,"/concept_manager/lookup_concept/")}function lookup_entry(t){lookup_id(t,"/concept_manager/lookup_entry/")}function lookup_id(t,e){var i=$(t);$.ajax({url:e+i.val(),beforeSend:function(){i.siblings(".entries").html('<p style="text-align: center;"><img src="http://160.111.248.29/assets/green_loader.gif"/></p>')},success:function(t){i.siblings(".entries").html(t),i.siblings(".entries").attr("taxon_concept_id",$(this).attr("id")),add_drag_events_to_selector(i)},error:function(){i.siblings(".entries").html("lookup failed")}})}function supercede_concepts(t,e){$.ajax({url:"/concept_manager/supercede_concepts?id1="+t+"&id2="+e,beforeSend:function(){$("#left_panel .entries, #right_panel .entries").html('<p style="text-align: center;"><img src="http://160.111.248.29/assets/green_loader.gif"/></p>')},success:function(){$("#right_panel .entries").html("");var i=t;t>e&&(i=e),$("#tc1").val(i),lookup_concept("#tc1"),alert("Concepts were successfully merged")},error:function(){$("#right_panel .entries").html(""),$("#left_panel .entries").html("something went wrong")}})}function split_entry(t){$.ajax({url:"/concept_manager/split_entry_from_concept/"+t,beforeSend:function(){$("#left_panel .entries, #right_panel .entries").html('<p style="text-align: center;"><img src="http://160.111.248.29/assets/green_loader.gif"/></p>')},success:function(t){$("#right_panel .entries").html("");var e=t;$("#tc1").val(e),lookup_concept("#tc1"),alert("Concepts were successfully merged")},error:function(){$("#right_panel .entries").html(""),$("#left_panel .entries").html("something went wrong")}})}function add_drag_events_to_selector(t){t.siblings(".entries").children(".entry_details").hover(function(){$(this).addClass("entry_hover")},function(){$(this).removeClass("entry_hover")}).draggable({opacity:.5,revert:!0,start:function(){dragged_div=$(this),$(this).css("z-index",9)}}).mouseup(function(){return"undefined"!=typeof dragged_div&&null!==dragged_div?(previously_dragged_div=dragged_div,dragged_div.css("z-index",10),dragged_div=null,dropped_div=$(".entry_hover"),"undefined"==typeof dropped_div?(alert("fail"),void 0):(dropped_div.attr("hierarchy_entry_id")==previously_dragged_div.attr("hierarchy_entry_id")?alert("Cannot drop - same concept"):dropped_div.attr("taxon_concept_id")==previously_dragged_div.attr("taxon_concept_id")?alert("Cannot drop - same concept"):alert("Dropping "+previously_dragged_div.attr("hierarchy_entry_id")+" to "+dropped_div.attr("hierarchy_entry_id")),void 0)):void 0})}dragged_div=null,$(document).ready(function(){$("#tc1 + input").on("click",function(){lookup_concept("#tc1")}),$("#he1 + input").on("click",function(){lookup_entry("#he1")}),$("#tc2 + input").on("click",function(){lookup_concept("#tc2")}),$("#he2 + input").on("click",function(){lookup_entry("#he2")}),$("#merge_concepts").hover(function(){$(this).addClass("entry_hover")},function(){$(this).removeClass("entry_hover")}).on("click",function(){var t=$("#left_panel .entry_details").length,e=$("#right_panel .entry_details").length;if(0===t||0===e)return alert("You can only merge two concepts"),void 0;var i=$("#left_panel .entry_details:first").attr("taxon_concept_id"),n=$("#right_panel .entry_details:first").attr("taxon_concept_id");return i==n?(alert("Cannot merge: these concepts are the same"),void 0):(supercede_concepts(i,n),void 0)}),$("#split_concepts").hover(function(){$(this).addClass("entry_hover")},function(){$(this).removeClass("entry_hover")}).mouseup(function(){return"undefined"==typeof dragged_div?(alert("fail1"),void 0):null===dragged_div?(alert("fail2"),void 0):(previously_dragged_div=dragged_div,dragged_div.css("z-index",10),dragged_div=null,dropped_div=$(".entry_hover"),"undefined"==typeof dropped_div?(alert("fail"),void 0):(split_entry(previously_dragged_div.attr("hierarchy_entry_id")),void 0))})});