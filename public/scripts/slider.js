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
  if(e.which === 39 && slider.value < 300){
    slider.value++;
    app.gameBoardView.updateTurn(slider.value);
      //set actual range handle to range property plus 1 on key down
      parseInt($('.range-handle').css('left',
		  parseInt($('.range-handle').css('left')) + 1));
		  //set status bar
		  parseInt($('.range-quantity').css('width',
		  parseInt($('.range-quantity').css('width')) + 1));
  }
  if(e.which === 37){
    if(slider.value < 1){
      return;
    }
    
    else{
    	//exactly the same as line 18 but decrementing
  	  slider.value--;
  	  app.gameBoardView.updateTurn(slider.value);
  	  parseInt($('.range-handle').css('left',
		  parseInt($('.range-handle').css('left')) - 1));
		  parseInt($('.range-quantity').css('width',
		  parseInt($('.range-quantity').css('width')) - 1)); 
    }

  }
});