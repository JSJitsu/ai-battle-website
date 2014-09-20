var SiteDownView = Backbone.View.extend({

  initialize: function(){
    this.render();
  },

  render: function(){
    var html = '<div class="site-down"><div class="row text-center"><h1 class="col-lg-12">Sorry, something went wrong</h1></div><div class="row"><img class="img-responsive" src="../../img/sad-knight.png"></div><div class="row text-center"><h3 class="col-lg-12">Please check back in a couple hours!</h4></div></div>';

    
    this.$el.html(html);
  }
});