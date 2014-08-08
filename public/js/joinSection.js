window.onload = function(){
    var template = "";
    var data = "";

    // if logged in:
    template = "notLoggedIn";

    // logged in not signed up:
    // template = "loggedInNotSignedUp";

    // logged in signed up:
    // template = "loggedInSignedUp";

    var html = new EJS({url: '/templates/' + template + '.ejs'}).render(data);
    $('#join').html(html);
};