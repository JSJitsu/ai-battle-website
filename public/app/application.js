var user = riot.observable();

user.login = function (params) {
  $.getJSON('/api/user', function (data) {
    user.trigger('login', data);
  });
};

riot.compile(function () {
  route.start();
  // here tags are compiled and riot.mount works synchronously
  var tags = riot.mount('*', { user: user });

  console.debug(tags);

  user.login();
});