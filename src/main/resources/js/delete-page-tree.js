AJS.toInit(function ($) {
    if (!AJS.Meta.get("remote-user")) return;

	var $body = $("body");
    $body.append(com.zxlnet.plugins.confluence.templates.DeletePageHierarchy.deletePageDialog());

    var currentPageId = +AJS.params.pageId;
	var parentPageId = AJS.params.parentPageId;
    var deletePageTreeDialog = AJS.dialog2("#delete-page-tree-dialog");
    var loadingIndicator = Confluence.PageLoadingIndicator($body);

	$("#delete-page-tree-link").click(function(e) {
        deletePageTreeDialog.show();
    });

	$("#delete-page-tree-dialog-confirm").click(function(e) {
		e.preventDefault();
        deletePageRecursively(currentPageId);
    });

	$("#delete-page-tree-close").click(function(e) {
		e.preventDefault();
        deletePageTreeDialog.hide();
    });

	function deletePageRecursively(pageId){
		loadingIndicator.show();
		$.ajax({
			dataType: "json",
			type:"get",
			async: false,
			url: Confluence.getContextPath() + "/rest/api/content/" + pageId + "/child/page",
			success: function(data) {
				if (data.results.length > 0) {
					for(var i in data.results){
						deletePageRecursively(data.results[i].id);
					}

					deleteSinglePage(pageId);
				}
				else {
					deleteSinglePage(pageId);
				}

				window.location.href=Confluence.getContextPath() + "/pages/viewpage.action?pageId=" + parentPageId;

				loadingIndicator.hide();
			},
			error: function(e) {
				AJS.log("delete page tree failure.");
				AJS.log(e);
				loadingIndicator.hide();
			}
		});
	}

	function deleteSinglePage(pageId){
		$.ajax({
			dataType: "json",
			type:"delete",
			async: false,
			url: Confluence.getContextPath() + "/rest/api/content/" + pageId ,
			success: function(data) {
				AJS.log(data);
			},
			error: function(e) {
				AJS.log("delete page[" + pageId + "] failure.");
				AJS.log(e);
			}
		});
	}
});