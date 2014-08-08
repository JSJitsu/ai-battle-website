$(document).on('ready', function(){
  
  var template = "";

  $.ajax({
    method: 'GET',
    url: '/userinfo',
  })
  .done(function(data){
    console.log('data: ', data);
    if (data.githubHandle){
      $('#userContent').text('Hello, ' + data.githubHandle);
      if (data.codeRepo) {
        template = "loggedInSignedUp";
      } else {
        template = "loggedInNotSignedUp";
      }
    } 
    render(template, data);
  })
  .error(function(xhr, status){
    if (status !== 'success') {
      $('#userContent').text('Join The Fight!');
      template = "notLoggedIn";
      render(template);
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


  var render = function(template, data) {
    $('#join').html('');
    var html = new EJS({url: '/templates/' + template + '.ejs'}).render(data);
    $('#join').html(html);
  };

});
