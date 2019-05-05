var user = riot.observable();

user.login = function (params) {
  $.getJSON('/api/user', function (data) {
    user.name = data.github_login;
    user.trigger('login', data);
  });
};

user.getCurrentUserClass = function (test) {
  return (user.name === test ? 'current-user' : '');
};

// riot.compile(function () {
  route.start();
  // here tags are compiled and riot.mount works synchronously
  var tags = riot.mount('*', { user: user });

  user.login();
// });