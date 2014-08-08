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
    if (status !== 'success') {
      $('#userContent').text('Join The Fight!');
    }
  });
  $('.team-pic').hover(function(){
    // $(this).css({'opacity': '0.5'});
    $(this).find('#role').show();
  }, function(){
    // $(this).css({'opacity': '1'});
    $(this).find('#role').hide();
  });
})