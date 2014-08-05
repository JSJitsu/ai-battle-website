//query slider
var slider = document.querySelector('.slider');
//intialize new slider
var init = new Powerange(slider, { hideRange: false, min: 1, max: 2000, start: 1});
var sliderPos = slider.value;
//count keydowns to keep track of current turn
var turn = 0;
//listens for slider changes and renders backbone view accordingly
slider.onchange = function() {
  app.gameView.updateTurn(slider.value);
};
//listens for keydown events to control scrobbling
$(document).keydown(function(e){
  //Allows us to check actual pixel value of slider-handle 
  var slideQuanity = parseFloat($('.range-handle').css('left'));
  //gets current turn in the case user dragged handle instead of scrobbled
  turn = app.game.get('turn');
  //translates dragging to scrobbling (i.e if dragged to turn 900 the value will be 900 multiplying by
  // (580 / 2000) gives us the corresponding pixels to translate)
  sliderPos = parseFloat(slider.value) * (580 / 2000);
  //check if key down is actually left of right return if not
  if(e.which !== 39){
    if(e.which !== 37){
      return;
    }
  }
  //check if key is right and if slideQuanity (blue bar) is not yet full
  if(e.which === 39 && slideQuanity < 580){
    //add .299 which is a slightly tweeked version of 580 / 2000(width of bar is 580px there are 2000 turns) 
    slider.value = parseFloat(slider.value) + 0.299;
    turn++;
  }
  if(e.which === 37 && slider.value > 1){
    slider.value = parseFloat(slider.value) - 0.299;
    turn--;
  }
  //updateturn and css with corresponding pixel values
  app.gameView.updateTurn(turn); 
  $('.range-handle').css('left',sliderPos);
  $('.range-quantity').css('width',sliderPos);
});
