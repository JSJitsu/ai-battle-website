/*!
 * Start Bootstrap - Freelancer Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */
// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('body').on('click', '.page-scroll a', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Floating label headings for the contact form
$(function() {
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
        $(this).toggleClass("floating-label-form-group-with-value", !! $(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
        $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
        $(this).removeClass("floating-label-form-group-with-focus");
    });
    var hideTip = function () {
      $('.game-tips').fadeOut('slow');
      $('body').off('click', hideTip);
    };

    $('body').on('click', '.hide-tip', hideTip);
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
});


// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});


// parallax

var init = function() {
  scrollIntervalId = setInterval(updatePage,10);
  $('.parallax-inner').addClass(getTime());
};

var setScrollTops = function() {
  var $window = $(window);
  scrollTop = $window.scrollTop();
  pageWidth = $window.width();
};

var updatePage = function() {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(function() {
      setScrollTops();
      animateObjects();
    });
  } else {
    setScrollTops();
    animateObjects();
  }
};

var animateObjects = function() {
  var $parallax = $(".parallax-inner"),
      $hero = $(".parallax-hero.red");

  $parallax.css({
    "background-position":"50% -"+ (( scrollTop / 4 ) + 500 )+ "px "
  });

  $hero.css({
    "bottom":scrollTop / 4 + 64 + "px"
  });

}

function getTime() {
  var hour = new Date().getHours();
  var times = [
    {hour: 0,name: 'late_night'},
    {hour: 5, name: 'morning'},
    {hour: 11, name: 'late_morning'},
    {hour: 13, name: 'afternoon'},
    {hour: 15, name: 'late_afternoon'},
    {hour: 17, name: 'evening'},
    {hour: 19, name: 'late_evening'},
    {hour: 21, name: 'night'}
  ];

  for (var i in times) {
    if (hour < times[i].hour) {
      return times[i].name;
    }
  }

  return times[times.length - 1].name;
}

init();

