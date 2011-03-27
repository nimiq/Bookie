test('bookie_init', function () {
    // first set an api key and we'll check it later
    localStorage['api_key'] = 'testingapikey';
    bookie.init();
    equal('testingapikey', $('#api_key').val(),
            "Verify we set the api key in init()");

});


/**
 * Make sure that once we enable the delete button it's visible
 *
 */
test("delete_button", function () {
    equal($('#delete:visible').length, 0,
            "Delete button is not visible");
    bookie.init();
    bookie.ui.enable_delete();
    equal($('#delete:visible').length, 1,
            "Delete button is visible");
});


/**
 * Test the form population
 *
 * Given a tab object with a url/page title
 * We're testing that a call to posts/get works and loads up our form with
 * great data from the database
 *
 */
test('populate_form', function () {

    // let's try mocking out the ajax method
    var options;
    $.ajax = function (params) {
        options = params;
    }

    mocked_return = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<posts user="none" dt="2010-03-10" tag="">' +
            '<post href="http://google.com"' +
            '    hash="---"' +
            '    description="Test Description"' +
            '    extended="Extended Description"' +
            '    tag="unit test" time=""' +
            '    others="--"></post> ' +
        '</posts>';

    var url = {
        'url': 'http://google.com',
        'title': 'Google search stuff'
    };

    bookie.populateFormBase(url);

    // now call the success method since we should get a 200 here
    options.success(mocked_return);

    // now the form should have a tag and description there
    equal('unit test', $('#tags').val(),
            "The tags we mocked should be set on the form");
    equal('Test Description', $('#description').val(),
            "The desc we mocked should be set on the form");
    equal('Extended Description', $('#extended').val(),
            "The ext desc we mocked should be set on the form");

    // and the delete button should not be visible since we found a record
    equal($('#delete:visible').length, 1,
            "Delete button is visible");
});

/**
 * Verify that we get the correct data and ui calls when we store a bookmark
 */
test('saveBookmark', function () {

    ok(false);

});
