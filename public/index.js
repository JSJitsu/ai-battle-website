$(document).on('ready', function(){
  $.ajax({
    method: 'GET',
    url: '/userinfo',
  })
  .done(function(data, err){
    if (data.githubHandle){
      $('#userContent').text('Hello, ' + data.githubHandle);
    }
  });
})