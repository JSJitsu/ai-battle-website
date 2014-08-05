//query slider
var slider = document.querySelector('.slider');
//intialize new slider
var init = new Powerange(slider, { hideRange: false, min: 1, max: 2000, start: 1});
//listens for slider changes and renders backbone view accordingly

slider.onchange = function() {
	app.gameView.updateTurn(slider.value);
};
//listens for keydown events to control scrobbling
$(document).keydown(function(e){
  var turn = app.gameView.get('turn');
  if(e.which === 39 && slider.value < 2000){

    slider.value++;
  }
  if(e.which === 37 && slider.value > 1){
    slider.value--;
  }
  $('.range-handle').css('left',parseInt(slider.value));
	$('.range-quantity').css('width',parseInt(slider.value));
});
