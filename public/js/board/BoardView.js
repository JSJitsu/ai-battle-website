/* globals _,Backbone,$,BoardTileView */
/* exported BoardView */
module.exports = Backbone.View.extend({
    tagName: 'section',
    className: 'battle-map',
    initialize: function (config) {
        this.board = config.board;
        this.rows = [];
        this.render();
    },
    render: function () {
        this.createBoardView();
        this.rendered = true;
    },
    createBoardView: function () {
        var me = this,
            fragment = document.createDocumentFragment();

        // Shows the team that won the game
        fragment.appendChild($('<div class="battle-map-message">')[0]);

        _.each(this.board.tiles, function (tileRow, rowIndex) {
            var $tr = $('<div class="tile-row">');

            if (!me.rows[rowIndex]) {
                me.rows[rowIndex] = [];
            }

            _.each(tileRow, function (tile, tileIndex) {
                var tileView = me.rows[rowIndex][tileIndex];

                if (!tileView) {
                    me.rows[rowIndex][tileIndex] = tileView = new BoardTileView({
                        tile: tile
                    });

                    $tr.append(tileView.$el);
                } else {
                    tileView.tile = tile;
                    tileView.render();
                }

            });

            fragment.appendChild($tr[0]);
        });

        if (!this.rendered) {
            me.$el.html(fragment);
        }
    }
});
