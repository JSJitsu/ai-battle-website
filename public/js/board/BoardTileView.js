/* globals Backbone,gameAssets */
/* exported BoardTileView */
var BoardTileView = Backbone.View.extend({
    tagName: 'div',
    className: 'battle-tile',
    initialize: function (config) {
        this.tile = config.tile;
        this.render();
    },
    render: function () {
        var tile = this.tile,
            subType = tile.subType,
            type = tile.type,
            html = '',
            colors,
            owner,
            extraClasses = '';

        colors = {
            0: 'team-blue',
            1: 'team-red'
        };

        owner = tile.owner;

        // TODO : make a factory pattern or something for this to be way less complicated and repetative

        if (subType !== 'Unoccupied') {
            if (subType === 'BlueFainted' || subType === 'RedFainted') {
                extraClasses = 'fainted';
            }

            if (type === 'DiamondMine') {
                var spriteImg = gameAssets[subType];
                if (owner && owner.team === 0) {
                    spriteImg = gameAssets[subType + 'Blue'];
                } else if (owner && owner.team === 1) {
                    spriteImg = gameAssets[subType + 'Red'];
                }
                html = '<img src="' + spriteImg + '" class="sprite" ' + extraClasses + '">';
            } else {
                html = '<img src="' + gameAssets[subType] + '" class="sprite ' + extraClasses + '">';
            }
            if (extraClasses === 'fainted') {
                html += '<span class="indicator fainted">' + tile.id + '</span>';
            }

            if (type === 'Hero') {
                html = this.buildHeroHtml(tile, colors);
            } else if (type === 'DiamondMine') {
                if (owner) {
                    html += '<span class="indicator ' + colors[owner.team] +'">' + owner.id + '</span>';
                }
            }
        }

        // This section "diffs" the tile to see if its html should change. It provides a massive
        // performance boost by only needing to update changed tiles instead of every tile.
        if (this.lastHtml !== html) {
            this.$el.html(html);
        }

        this.lastHtml = html;
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

        if (app.user.get('github_login') === name) {
            html += '<span class="arrow"></span>';
        }

        return html;
    }
});
