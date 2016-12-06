//https://pgodb.net/fr/moves/
var rows = $("tr[role=row]")

var _moves = [];

$.each(rows, function(i,row){
  //var row = rows[0]
  var fr = $(row).find("td a div:first").text()
  var en = $(row).find("td a div[lang=en]").text()
  if(en && fr){
    var move = {};
    move[en]= fr;
    _moves.push(move);
  }
});
console.log(JSON.stringify(_moves));
