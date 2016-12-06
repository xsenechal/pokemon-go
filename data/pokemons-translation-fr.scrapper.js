// http://www.eclypsia.com/fr/pokemon-go/guides/tuto1424.html
var pokedex = {};
var trs = $("#ec_content table tr")
$.each(trs, function(i, item){
  if(i>0){
    var id =    parseInt(item.children[0].textContent.replace('\n',''))
    var name =  item.children[2].children[0].text
    pokedex[id] = name;
    console.log(id + name);
  }
});

console.log(JSON.stringify(pokedex));
