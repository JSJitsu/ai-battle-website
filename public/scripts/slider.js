var slider = document.querySelector('.slider');
var init = new Powerange(slider, { hideRange: true, min: 10, max: 300, start: 10});
slider.onchange = function() {
	app.gameBoardView.updateTurn(slider.value);
  console.log(slider.value)
};
