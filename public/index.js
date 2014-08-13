$(document).on('ready', function(){
  
  var template = "";

  $.ajax({
    method: 'GET',
    url: '/userinfo',
  })
  .done(function(data){
    if (data.githubHandle){
      $('#userContent').text('Hello, ' + data.githubHandle);
        template = "loggedIn";
        // $('.' + data.githubHandle).addClass('highlightedUser');
        // console.log($('.highlightedUser'));
    } 
    // render(template, data);
  })
  .error(function(xhr, status){
    if (status !== 'success') {
      $('#userContent').text('Join The Fight!');
      template = "notLoggedIn";
      // render(template);
    }
  });

  $('.team-pic').hover(function(){
    // $(this).css({'opacity': '0.5'});
    $(this).find('.role').fadeIn();
    $(this).find('img').toggleClass('blur-pic');
  }, function(){
    // $(this).css({'opacity': '1'});
    $(this).find('.role').fadeOut();
    $(this).find('img').toggleClass('blur-pic');
  });


 $('.nav-tabs>li>a').on('click', function(e){
    e.preventDefault();
    console.log('click!')
    $(this).parent().tab('show')
  })  

});
