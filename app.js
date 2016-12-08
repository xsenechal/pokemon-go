var myApp = angular.module('myApp',[]);

//myApp.directive('myDirective', function() {});
//myApp.factory('myService', function() {});

function MyCtrl($scope, $filter,$http) {

	var efficiency;
	var cpM = 0.79030001;
	
	var average = function(fromDefensor){
		var sum = 0;
		angular.forEach(fromDefensor, function(income) {
                	sum += income.healthLost; 
		});
		return sum / fromDefensor.length;
	}

	$scope.display=1;
	$scope.versus = {defensor: "", pokeDefensor: null, pokemons: []};
	//$scope.defensor = "Bulbasaur";
	//$scope.pokeDefensor = null;
	$scope.filter = "Id";
	$scope.reverse = false;

	$scope.stab = function(pokemon, move){
		return move.type.toUpperCase() == pokemon.Type1.toUpperCase() || move.type.toUpperCase() == pokemon.Type2.toUpperCase()
	};

	$scope.efficiency = function(move, pokemon){
		var e1 = efficiency[move.type.toUpperCase()]?efficiency[move.type.toUpperCase()][pokemon.Type1.toUpperCase()] || 1:1;
		var e2 = efficiency[move.type.toUpperCase()]?efficiency[move.type.toUpperCase()][pokemon.Type2.toUpperCase()] || 1:1;
		return e1*e2;
	};

	$scope.computeVersus = function(){
		$scope.versus.pokemons = [];
		if($scope.versus.pokeDefensor){
			
			//$scope.versus.pokeDefensor = $filter('filter')($scope.pokemons, {"localName":$scope.versus.defensor})[0];
			var defensorHealth = ($scope.versus.pokeDefensor.BaseStamina + 15) * cpM;
			angular.forEach($scope.pokemons, function(pokemon){
				var fromDefensor = [];
				var health = (pokemon.BaseStamina + 15) * cpM;
				angular.forEach($scope.versus.pokeDefensor['Quick Moves'], function(move){
					var defensorDps = (Math.floor((((($scope.versus.pokeDefensor.BaseAttack+15)*move.power)/(pokemon.BaseDefense+15))/2)*($scope.stab($scope.versus.pokeDefensor, move)?1.25:1)*$scope.efficiency(move, pokemon))+1)/2;
					fromDefensor.push({
						localName: move.localName,
						dps: defensorDps,
						healthLost: defensorDps / health * 100}
					);
          			});
				var averageHealthLost = average(fromDefensor);
        			angular.forEach(pokemon['Quick Moves'], function(move){
          				var dmg = Math.floor(((((pokemon.BaseAttack+15)*move.power)/($scope.versus.pokeDefensor.BaseDefense+15))/2)*($scope.stab(pokemon, move)?1.25:1)*$scope.efficiency(move, $scope.versus.pokeDefensor))+1;
					var dps = dmg/+(move.durationMS.replace(',', '')) * 1000;
            				$scope.versus.pokemons.push({
						Id: pokemon.Id, 
						Name: pokemon.Name,
						localName: pokemon.localName,
						Type1: pokemon.Type1, 
						Type2: pokemon.Type2, 
						BaseAttack: pokemon.BaseAttack, 
						BaseDefense: pokemon.BaseDefense, 
						BaseStamina: pokemon.BaseStamina, 
						moveName: move.name, 
						moveLocalName: move.localName, 
						damage: dmg, 
						dps: dps,
						healthLost: dps / defensorHealth * 100,
						income: fromDefensor,
						rated: (dps / defensorHealth * 100) / averageHealthLost,
						Legendary:pokemon.Legendary}
					);
          			});
			});
		}
	};

	$scope.orderBy = function(value){
		$scope.filter = value;
		$scope.reverse = !$scope.reverse;
	};

	$scope.runTime = function(){
		angular.forEach($scope.pokemons, function(pokemon){
          		//pokemon.maxCP = pokemon["Max CP"];
         		//pokemon.maxHP = pokemon["Max HP"];
			pokemon.sum = pokemon.BaseAttack + pokemon.BaseDefense + pokemon.BaseStamina;
			pokemon.prod = pokemon.BaseAttack * pokemon.BaseDefense * pokemon.BaseStamina;
			pokemon["Quick Moves"] = [];
			pokemon["Charge/Special Moves"] = [];
			pokemon["localName"] = $scope.pokemonsTranslation[pokemon.Id];
		});

		angular.forEach($scope.moves, function(move){
			move['displayName'] = move.name.toLowerCase().replace(/\b\w/g, function(l){ return l.toUpperCase() });
			move['localName'] = $scope.movesTranslation[move['displayName']];
			angular.forEach(move.pokemons, function(id){
				var tmp = $filter('filter')($scope.pokemons, {Id: +id}, true);
				angular.forEach(tmp, function(pokemon){
					pokemon[move.category].push(move);
				});
			});
		});

	};

	//__RUNTIME__

	$http.get('data/pokemons.json').success(function(pokemons){
		$scope.pokemons = pokemons;
		$http.get('data/moves.json').success(function(moves){
			$scope.moves = moves;
			$http.get('data/efficiency.json').success(function(data){
				efficiency = data;
				$http.get('data/moves-translation-en-fr.json').success(function(data){
					$scope.movesTranslation = data;
					$http.get('data/pokemons-translation-fr.json').success(function(data){
						$scope.pokemonsTranslation = data;
						$scope.runTime();
					});
				});
			});
		});
	});
}
