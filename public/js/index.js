$(document).on('ready', function(){
  if($('.user-options')){
    $('.user-options').remove()}
  $('.team-pic').hover(function(){
    $(this).find('.role').fadeIn();
    $(this).find('img').toggleClass('blur-pic');
  }, function(){
    $(this).find('.role').fadeOut();
    $(this).find('img').toggleClass('blur-pic');
  });

 $('.nav-tabs>li>a').on('click', function(e){
    e.preventDefault();
    console.log('click!')
    $(this).parent().tab('show')
  })  

});
