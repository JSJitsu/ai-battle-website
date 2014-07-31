//query slider
var slider = document.querySelector('.slider');
//intialize new slider
var init = new Powerange(slider, { hideRange: true, min: 1, max: 300, start: 1});
//listens for slider changes and renders backbone view accordingly
slider.onchange = function() {
	app.gameBoardView.updateTurn(slider.value);
};

//listens for keydown events to control scrobbling
$(document).keydown(function(e){
  if(e.which === 39){
  	// app.gameBoardView.updateTurn(slider.value);
    slider.value++;
    app.gameBoardView.updateTurn(slider.value);
  }
  if(e.which === 37){
    if(slider.value < 1){
      return;
    }
    else{
  	  slider.value--;
  	  app.gameBoardView.updateTurn(slider.value);
    }

  }
});