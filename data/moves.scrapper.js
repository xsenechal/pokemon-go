//https://thesilphroad.com/research#moves

/******************* Inject tools ****************************/
var s = document.createElement('script');
s.type = 'text/javascript';
s.src = 'https://cdn.jsdelivr.net/lodash/4.17.2/lodash.min.js';
document.getElementsByTagName('head')[0].appendChild(s);
/******************* Inject tools ****************************/

var _moves = [];
var moves = $("#moves table .statRow")

_.each(moves, function(move){
  //var move = moves[0]

  //quick / special
  var category = move.parentElement.parentNode.parentNode.children[0].textContent

  //DPS
  var dps  = $(move).find("span.hidden-xs").text()

  //move's name and pokemon type
  var titles = $(move).find("td.hidden-xs").text().trim().split('\n')
  var name        = titles[0].trim()
  var type        = titles[1].trim().split('/')[0].trim()
  if(type.indexOf('/')>0){
    type = type.split('/')[0].trim()
  }

  var power         = $(move).find("td")[2].textContent
  var durationMS    = $(move).find("td")[3].textContent
  var damageWindow  = $(move).find("td")[4].textContent

  var pokemons = _.map($(move.nextElementSibling).find(".text-center > img"), function(img){return img.src.split('/')[7].replace('.png', '') })
  var _move = {
    "category":category,
    "dps":dps,
    "name":name,
    "type":type,
    "power":power,
    "durationMS":durationMS,
    "damageWindow":damageWindow,
    "pokemons":pokemons
  };
  _moves.push(_move);

});

console.log(JSON.stringify(_moves));
