//query slider
var slider = document.querySelector('.slider');
//intialize new slider
var init = new Powerange(slider, { hideRange: false, min: 1, max: 2000, start: 1});
//listens for slider changes and renders backbone view accordingly
var sliderPos = slider.value;
var count = 0;
slider.onchange = function() {
  app.gameView.updateTurn(slider.value);
  console.log(count, '-count in drag', slider.value + '-slider value in drag') ;
};
//listens for keydown events to control scrobbling
$(document).keydown(function(e){
  count = app.game.get('turn');
  sliderPos = slider.value;
  // var turn = app.gameView.get('turn');
  if(e.which === 39 && slider.value < 580){
    console.log(count, '-count in key', slider.value + '-slider value in key');
    slider.value = parseFloat(slider.value) + 0.29;
    sliderPos = parseFloat(sliderPos) + .29
    parseInt(count++);
    app.gameView.updateTurn(count);
    app.game.updateTurn(count);    
  }
  if(e.which === 37 && slider.value > 1){
    slider.value--;
  }
  $('.range-handle').css('left',sliderPos);
  $('.range-quantity').css('width',parseInt(slider.value));
});
