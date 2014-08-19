var RulesView = Backbone.View.extend({
  
  initialize: function(){
    this.viewing = {};
    this.viewing = "rules";
    this.render();
  },

  events: {
    'click .general': 'showGeneral',
    'click .rules': 'showRules',
    'click .improve': 'showImprove'
  },

  showRules: function(event) {
    event.preventDefault();
    this.viewing = "rules";
    this.render();
    $('.rules').tab('show');
  },
  
   showGeneral: function(event) {
    event.preventDefault();
    this.viewing = "general";
    this.render();
    $('.general').tab('show');
  },

   showImprove: function(event) {
    event.preventDefault();
    this.viewing = "improve";
    this.render();
    $('.improve').tab('show');
  },

  render: function(){
    var html;
    if(this.viewing === "rules") {
      html = new EJS({url: '/ejs_templates/rules'}).render(this.model);
    } else if (this.viewing === "general") {
      html = new EJS({url: '/ejs_templates/general'}).render(this.model);
    }  else if (this.viewing === "improve") {
      html = new EJS({url: '/ejs_templates/improve'}).render(this.model);
    }
    this.$el.html(html);
  }


});