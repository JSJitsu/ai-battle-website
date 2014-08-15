$(document).on('ready', function(){
  
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
