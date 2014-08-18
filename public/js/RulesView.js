var RulesView = Backbone.View.extend({
  
  initialize: function(){
    this.viewing = {};
    this.viewing = "rules";
    this.render();
  },

  events: {
    'click .rules': 'showRules',
    'click .brains': 'showBrains',
    'click .improve': 'showImprove'
  },

  showRules: function(event) {
    event.preventDefault();
    this.viewing = "rules";
    this.render();
    $('.rules').tab('show');
  },
  
   showBrains: function(event) {
    event.preventDefault();
    this.viewing = "brains";
    this.render();
    $('.brains').tab('show');
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
    } else if (this.viewing === "brains") {
      html = new EJS({url: '/ejs_templates/brains'}).render(this.model);
    }  else if (this.viewing === "improve") {
      html = new EJS({url: '/ejs_templates/improve'}).render(this.model);
    }
    this.$el.html(html);
  }


});