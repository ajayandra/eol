EOL.init_curation_behaviours=function(){!function(e){var t={trusted:function(){this.closest("fieldset").find("ul").hide().end().find("select[name*=visibility]").prop("disabled",!1).trigger("change")},unreviewed:function(){this.closest("fieldset").find("ul").hide().end().find("select[name*=visibility]").prop("disabled",!1).trigger("change")},untrusted:function(){this.closest("fieldset").find("select[name*=visibility]").val("hidden").prop("disabled",!0).end().find("ul").hide().filter(".untrusted").show()},hide:function(){this.closest("fieldset").find("ul").hide().filter(".hidden").show()},show:function(){this.closest("fieldset").find("ul").hide()}};e.find("select").change(function(){var e=$(this);e.is(":enabled")&&t[e.find(":selected").attr("class")].apply(e)}).trigger("change"),e.find("fieldset").each(function(){0===$(this).find("select").length&&$(this).find("ul").hide()})}($("form.review_status"))};