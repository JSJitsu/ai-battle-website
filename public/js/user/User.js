var User = Backbone.Model.extend({

  // give model url attribute for server to handle
    url: '/userInfo',

  // set id attribute so that we can do put requests
  // backbone looks for 'id' otherwise
    idAttribute: '_id',
    fetchRecent: function (callback) {
        this.fetch({
            url: this.url + '/stats/recent',
            success: callback
        });
    },
    fetchAverage: function (callback) {
        this.fetch({
            url: this.url + '/stats/average',
            success: callback
        });
    },

    average: function () {
        var me = this;

        var numbersForDisplay = function (prop) {
            return (Number(parseFloat(me.get('average_stats')[prop]).toFixed(2)) || 0);
        };

        var aveStats = {
            github_login: me.get('github_login'),
            gamesPlayed: me.get('average_stats').gamesPlayed,
            kills: numbersForDisplay('kills'),
            deaths: numbersForDisplay('deaths'),
            damageDealt: numbersForDisplay('damageDealt'),
            minesCaptured: numbersForDisplay('minesCaptured'),
            diamondsEarned: numbersForDisplay('diamondsEarned'),
            healthRecovered: numbersForDisplay('healthRecovered'),
            healthGiven: numbersForDisplay('healthGiven'),
            gravesRobbed: numbersForDisplay('gravesRobbed')
        };

        return aveStats;
    }

});
