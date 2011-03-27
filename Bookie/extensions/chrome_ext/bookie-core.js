/*jslint eqeqeq: false, browser: true, debug: true, onevar: true, plusplus: false, newcap: false, */
/*global $: false, window: false, self: false, escape: false, mor: false, sprintf: false, chrome: false, localStorage: false, */

/* chrome-extension-specific bookie functionality */

var bookie = (function (module, $) {

    // bootstrap some custom things that the extensions will jump in on
    module.ui = {};
    module.call = {};

    // some constants we'll use throughout
    // dom hook for triggering/catching events fired
    module.EVENTID = '#bmarkbody';

    // what url are we sending out requests off to?
    module.api_url = 'http://127.0.0.1:6543/delapi/';

    /**
     * Define events supported
     * Currently we've got LOAD, SAVED, ERROR, DELETE, UPDATE
     *
     */
    module.events = {
        'LOAD': 'load',
        'onload': function (ev) {
            $('#form').bind('submit', function (ev) {
                var data = form.serialize();
                bookie.call.saveBookmark(data);
            });

            module.populateForm();
        },

        'SAVE': 'save',
        'ERROR': 'error',

        /**
         * Make the call to remove the bookmark
         * Event constant and the event handler function
         *
         */
        'DELETE': 'delete',
        'ondelete': function (ev) {
            var url = $('#url').attr('value');
            var api_key = $('#api_key').attr('value');
            module.call.removebookmark(url, api_key);
        },

        'UPDATE': 'update'
    };

    /**
     * The server can respond to request with a number of success/error codes. We
     * want to provide a common mapping from application to client side code so
     * that we can provide a decent notification to the user
     *
     */
    module.response_codes = {
        // http status codes returned
        '200': 'Ok',
        '403': 'NoAuth',

        // some codes from the xml response in the delicious api
        'done': 'Ok',
        'Not Found': '404',
    };

    /**
     * The actual work to map the tab object data ot the form ui
     * This is shared across platforms as we want to keep the ui/code
     * consistent between them
     *
     */
    module.populateFormBase = function (tab_obj) {
        var url;

        console.log('in populate');
        $('#url').val(tab_obj.url);
        $('#description').val(tab_obj.title);
        $('#api_key').val(localStorage['api_key']);

        url = $('#url').attr('value');

        module.call.getBookmark(url, function (xml) {
            // this could come back as not found
            result = $(xml).find("result");

            if (result) {
                code = result.attr("code");
                console.log('Page is not currently bookmarked')
                // we don't update the badge, since this happens on every page
                // we load our ui from, it's not an error to not be found
            }

            $(xml).find("post").map(function () {
                // add the tags to the tag ui
                $('#tags').val($(this).attr('tag'));

                // add the description to the ui
                $('#description').val($(this).attr('description'));

                // add the description to the ui
                $('#extended').text($(this).attr('extended'));

                // now enable the delete button in case we want to delete it
                module.ui.enable_delete();

            });

        });
    };

    // bookie methods
    module.init = function (jquery_node) {
        $(module.EVENTID).bind(module.events.LOAD, module.events.onload);
        $(module.EVENTID).trigger(module.events.LOAD);
    };

    // cross platform ui calls
    module.ui.enable_delete = function (ev) {
        console.log('called');
        $('#delete').show();

        // and make sure we bind the delete event
        $(module.EVENTID).bind(module.events.DELETE, module.ondelete);
    };


    /**
     * Generate the get reuqest to the API call
     *
     */
    request = function (options) {
        var defaults, opts;

        defaults = {
            type: "GET",
            dataType: "xml",
            error: onerror
        };

        opts = $.extend({}, defaults, options);
        $.ajax(opts);
    };

    /*
     * Check if this is an existing bookmark
     * see http://delicious.com/help/api#posts_get
     *
     */
    module.call.getBookmark = function (url, callback) {
        var opts = {
            url: module.api_url + "posts/get",
            data: {url: url},
            success: callback,
        };

        request(opts);
    };

    /**
     * After pressing the save button, go store the new bookmark
     *
     */
    module.call.saveBookmark  = function (params, options) {
        var defaults, opts;

        defaults = {
            url: module.api_url + "posts/add",
            data: params,
            success: function (xml) {
                var result, code;

                result = $(xml).find("result");
                code = result.attr("code");

                if (code == "done") {
                    console.log("Bookmark saved to delicious!");
                } else {
                    chrome.browserAction.setBadgeText({text: code});
                    console.error("Error saving bookmark: " + code);
                }
            }
        };

        opts = $.extend({}, defaults, options);
        request(opts);
    };

    return module;
})(bookie || {}, jQuery);
