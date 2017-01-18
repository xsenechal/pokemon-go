//https://thesilphroad.com/species-stats

var pokedex = [];

var species = $(".speciesWrap");

$.each(species, function(i, specie){
	//var specie = $(".speciesWrap")[0]

	var Id   = +$(specie).find(".monPhotoWrap p").text().replace('#', '');
	var Name = $(specie).find(".monNameWrap h1").text();


	var types = $.map($(specie).find(".monTypes div"), function(div){ return div.textContent})
	var Type1 = types[0].replace(/\b\w/g, function(l){ return l.toUpperCase() });
	var Type2 = types[1];
	if(Type2){
        Type2 = Type2.replace(/\b\w/g, function(l){ return l.toUpperCase() });
	}else{
		Type2 = "None";
	}

	var Legendary 	= $(specie).hasClass("legendary");
	var Gen2 		= $(specie).hasClass("gen2");

	var progressBars = $(specie).find(".row-fluid .row-fluid");$(specie).find(".row-fluid .row-fluid")

	var BaseAttack  = +$(progressBars[1]).find(".progress").attr("title")
	var BaseDefense = +$(progressBars[2]).find(".progress").attr("title")
	var BaseStamina = +$(progressBars[3]).find(".progress").attr("title")

	pokedex.push({
	"Id": Id,
	"Name": Name,
	"BaseStamina": BaseStamina,
	"BaseAttack": BaseAttack,
	"BaseDefense": BaseDefense,
	"Type1": Type1,
	"Type2": Type2,
	"Legendary": Legendary,
	"Gen2": Gen2
	})
	
});


console.log(JSON.stringify(pokedex));
