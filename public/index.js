$(document).on('ready', function(){
  $.ajax({
    method: 'GET',
    url: '/userinfo',
  })
  .done(function(data){
    if (data.githubHandle){
      $('#userContent').text('Hello, ' + data.githubHandle);
    }
  })
  .error(function(xhr, status){
    console.log(status);
    if (status !== 'success') {
      $('#userContent').text('Join The Fight!');
    }
  });
  $('.team-pic').mouseover(function(){
    
  })
})