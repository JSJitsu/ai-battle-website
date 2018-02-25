<parallax>
  <style>
    .parallax {
      padding-top: 25px;
      height: 450px;
      overflow: hidden;
    }

    .parallax-inner,
    .parallax-hero {
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: -o-crisp-edges;
      -ms-interpolation-mode: nearest-neighbor;
    }

    .parallax-inner {
      background-repeat: repeat-x;
      background-position-y: -520px;
      height: 450px;
      position: relative;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
      transition: background-position linear 0.2s;
      background-size: 1920px;
    }

    .parallax-hero {
      background: url(../img/blue_knight.gif);
      width: 256px;
      height: 256px;
      position: absolute;
      bottom: -32px;
      left: 64px;
      background-size: 256px;
      z-index: 90;
    }

    .parallax-hero.red {
      width: 64px;
      height: 64px;
      bottom: 64px;
      right: 256px;
      left: inherit;
      background: url(../img/red_knight.gif);
      background-size: 64px;
      z-index: 85;
      transition: bottom linear 0.2s;
    }

  </style>
  <section class="parallax">
      <section class="parallax-inner" style={ bgstyles } ref="background">
          <figure class="parallax-hero"></figure>
          <figure class="parallax-hero red" ref="redHero"></figure>
      </section>
  </section>

  <script>
    let tag = this;

    function getTimeFrameName () {
      let hour = new Date().getHours();
      let times = [
        { hour: 0, name: 'late_night' },
        { hour: 5, name: 'morning' },
        { hour: 11, name: 'late_morning' },
        { hour: 13, name: 'afternoon' },
        { hour: 15, name: 'late_afternoon' },
        { hour: 17, name: 'evening' },
        { hour: 19, name: 'late_evening' },
        { hour: 21, name: 'night' }
      ];

      for (let i in times) {
        if (hour < times[i].hour) {
          return times[i].name;
        }
      }

      return times[times.length - 1].name;
    }

    // backgrounds are from www.bitday.me
    tag.bgstyles = {
      'background-image': `url(../img/${getTimeFrameName()}_header_smaller.gif)`
    };

    window.addEventListener('scroll', function () {
      let smallerOffset = Math.round(window.scrollY / 4);

      tag.refs.background.style['background-position-y'] = -(smallerOffset + 520) + 'px';
      tag.refs.redHero.style.bottom = (smallerOffset + 64) + 'px';
    });

  </script>
</parallax>