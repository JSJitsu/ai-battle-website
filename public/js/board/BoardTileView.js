/* globals Backbone,gameAssets */
/* exported BoardTileView */
var BoardTileView = Backbone.View.extend({
  tagName: 'div',
  className: 'battle-tile',
  initialize: function (config) {
    this.tile = config.tile;
    this.render();
  },
  render: function() {
    var tile = this.tile,
        subType = tile.subType,
        type = tile.type,
        html,
        colors,
        owner,
        extraClasses = '';

    if (subType !== 'Unoccupied') {
      if (subType === 'BlueFainted' || subType === 'RedFainted') {
        extraClasses = 'fainted';
      }
      html = '<img src="' + gameAssets[subType] + '" class="sprite ' + extraClasses + '">';
      if (extraClasses === 'fainted') {
	html += '<span class="indicator fainted">' + tile.id + '</span>';
      }
      colors = {
        0: 'team-blue',
        1: 'team-red'
      };

      if (type === 'Hero') {
        html = this.buildHeroHtml(tile, colors);
      } else if (type === 'DiamondMine') {
        owner = tile.owner;
        if (owner) {
          html += '<span class="indicator ' + colors[owner.team] +'">' + owner.id + '</span>';
        }
      }

      this.$el.html(html);
    }
  },
  buildHeroHtml: function (tile, colors) {
    var name = tile.name,
        heroId = tile.id,
        HP = tile.health,
        gameTurn = tile.gameTurn,
        lastActiveTurn = tile.lastActiveTurn,
        subType = tile.subType,
        html = '';

    if (lastActiveTurn === (gameTurn - 1) && gameTurn !== 1) {
      this.$('.sprite').addClass('current-turn');
    }

    html = '<img src="' + gameAssets[subType] + '" id="H' + heroId +'" class="sprite">';
    html += '<span class="indicator ' + colors[tile.team] +'">' + heroId + '</span>';
    html += '<span class="lifebar"><span class="life-capacity" style="background-color:hsl(' + HP + ', 60%,35%);height:' + (HP * .9) + '%"></span></span>';

    this.$el.addClass('current-user-' + name);

    return html;
  }
});
