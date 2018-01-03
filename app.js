var myApp = angular.module('myApp',[]);

//myApp.directive('myDirective', function() {});
//myApp.factory('myService', function() {});
myApp.filter('myFilterPokemon', function () {
    return function (pokemons, showLegendary, showGen3) {
				if(!pokemons) return pokemons;
	      var result = [];

	      angular.forEach(pokemons, function(pokemon){
					if(!showGen3 && pokemon.Gen3){
						return false;
					}
					if(!showLegendary && pokemon.Legendary){
						return false;
					}
					result.push(pokemon);
					return true;
	      });
	      return result;
    };
});
myApp.controller('MyCtrl', function($scope, $filter,$http) {
	var cpM = [0, 0.094, 0.135137432, 0.16639787, 0.192650919, 0.21573247, 0.236572661, 0.25572005, 0.273530381, 0.29024988, 0.306057377, 0.3210876, 0.335445036, 0.34921268, 0.362457751, 0.37523559, 0.387592406, 0.39956728, 0.411193551, 0.42250001, 0.432926419, 0.44310755, 0.4530599578, 0.46279839, 0.472336083, 0.48168495, 0.4908558, 0.49985844, 0.508701765, 0.51739395, 0.525942511, 0.53435433, 0.542635757, 0.55079269, 0.558830576, 0.56675452, 0.574569153, 0.58227891, 0.589887917, 0.59740001, 0.604818814, 0.61215729, 0.619399365, 0.62656713, 0.633644533, 0.64065295, 0.647576426, 0.65443563, 0.661214806, 0.667934, 0.674577537, 0.68116492, 0.687680648, 0.69414365, 0.700538673, 0.70688421, 0.713164996, 0.71939909, 0.725571552, 0.7317, 0.734741009, 0.73776948, 0.740785574, 0.74378943, 0.746781211, 0.74976104, 0.752729087, 0.75568551, 0.758630378, 0.76156384, 0.764486065, 0.76739717, 0.770297266, 0.7731865, 0.776064962, 0.77893275, 0.781790055, 0.78463697, 0.787473578, 0.79030001];

	var average = function(fromDefensor){
		var sum = 0;
		angular.forEach(fromDefensor, function(income) {
                	sum += income.healthLost;
		});
		return sum / fromDefensor.length;
	}

	$scope.lvl = {A: 40, D: 40};
	$scope.display=1;
	$scope.versus = {defensor: "", pokeDefensor: null, pokemons: []};
	//$scope.defensor = "Bulbasaur";
	//$scope.pokeDefensor = null;
	$scope.filter = "Id";
	$scope.reverse = false;
	$scope.filter2 = "rated";
	$scope.reverse2 = true;
	$scope.showGen3 = true;
	$scope.efficiencyTypes;
	$scope.selectedColumn = {};

	$scope.pourcent = function(val, max){
		return (+val/max)*100;
	};

	$scope.setDisplay = function(i){
		$scope.display = i;
	}

	$scope.stab = function(pokemon, move){
		return move.type.toUpperCase() == pokemon.Type1.toUpperCase() || move.type.toUpperCase() == pokemon.Type2.toUpperCase()
	};

	$scope.efficiency = function(move, pokemon){
		var e1 = $scope.efficiencyTypes[move.type.toUpperCase()]?$scope.efficiencyTypes[move.type.toUpperCase()][pokemon.Type1.toUpperCase()] || 1:1;
		var e2 = $scope.efficiencyTypes[move.type.toUpperCase()]?$scope.efficiencyTypes[move.type.toUpperCase()][pokemon.Type2.toUpperCase()] || 1:1;
		return e1*e2;
	};

	$scope.computeDamage = function(A, M, D, Al, Dl){
		var attack = (A.BaseAttack+15)*$scope.cpM(Al);
		var defence = (D.BaseDefense+15)*$scope.cpM(Dl);
		return Math.floor(0.5*M.power*attack/defence*($scope.stab(A, M)?1.25:1)*$scope.efficiency(M, D))+1;
	};

	$scope.cpM = function(lvl){
		return cpM[+lvl];
	};

	$scope.computeVersus = function(){
		$scope.versus.pokemons = [];
		if($scope.versus.pokeDefensor){

			//$scope.versus.pokeDefensor = $filter('filter')($scope.pokemons, {"localName":$scope.versus.defensor})[0];
			var defensorHealth = ($scope.versus.pokeDefensor.BaseStamina + 15) * $scope.cpM($scope.lvl.D);
			angular.forEach($scope.pokemons, function(pokemon){
				var fromDefensor = [];
				var health = (pokemon.BaseStamina + 15) * $scope.cpM($scope.lvl.A);
				angular.forEach($scope.versus.pokeDefensor['Quick Moves'], function(move){
					if(move.selected){
						var defensorDps = $scope.computeDamage($scope.versus.pokeDefensor, move, pokemon, $scope.lvl.D, $scope.lvl.A)/2;
						fromDefensor.push({
							localName: move.localName,
							dps: defensorDps,
							healthLost: defensorDps / health * 100}
						);
					}
          			});
				var averageHealthLost = average(fromDefensor);
        			angular.forEach(pokemon['Quick Moves'], function(move){
          				var dmg = $scope.computeDamage(pokemon, move, $scope.versus.pokeDefensor, $scope.lvl.A, $scope.lvl.D);
					var dps = dmg/+(move.durationMS.replace(',', '')) * 1000;
            				$scope.versus.pokemons.push({
						Id: pokemon.Id,
						Name: pokemon.Name,
						localName: pokemon.localName,
						Type1: pokemon.localType1,
						Type2: pokemon.localType2,
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
						Legendary:pokemon.Legendary,
						Gen2:pokemon.Gen2}
					);
          			});
			});
		}
	};
	
	$scope.analysePokemon = function(pokemon){
		var analyseMoveSet = function(pokemon, quickMove, chargeMove){
			var time = 0;
			var dmg = 0;
			var nrj = 0;
			while (true){
				var usedMove = quickMove;
				nrj = Math.min(100, nrj + +usedMove.damageWindow);
				if (nrj >= (+chargeMove.damageWindow*100/+chargeMove.power)){
					usedMove = chargeMove;
					nrj -= (+usedMove.damageWindow*100/+usedMove.power);
				}
				time += +usedMove.durationMS;
				if (time <= 600){
				   dmg += Math.floor(0.5*usedMove.power*pokemon.BaseAttack/146*($scope.stab(pokemon, usedMove)?1.25:1))+1;
				}
				else{
					break;
				}
			}
			return dmg/600;
		};
		
		var res = {};
		angular.forEach(pokemon['Quick Moves'], function(quickMove){
			angular.forEach(pokemon['Charge/Special Moves'], function(chargeMove){
				res[quickMove.localName+" | "+chargeMove.localName] = analyseMoveSet(pokemon, quickMove, chargeMove);
			});
		});
		console.log(res);
		return res;
	};	

	$scope.orderBy = function(value){
		$scope.filter = value;
		$scope.reverse = !$scope.reverse;
	};
	
	$scope.order2By = function(value){
		$scope.filter2 = value;
		$scope.reverse2 = !$scope.reverse2;
	};
	
	$scope.toggleColumn = function(type){
		$scope.selectedColumn[type] = !$scope.selectedColumn[type];
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
      pokemon["localType1"] = $scope.typesTranslation[pokemon.Type1];
      pokemon["localType2"] = $scope.typesTranslation[pokemon.Type2];
		});

		angular.forEach($scope.moves, function(move){
			move.selected = true;
			move['displayName'] = ""
			var tmp = move.name.split("_");
			angular.forEach(tmp, function(part){
				move['displayName'] += " "+part.toLowerCase().replace(/\b\w/g, function(l){ return l.toUpperCase() });
			});
			move['displayName'] = move['displayName'].substring(1);
			move['localName'] = $scope.movesTranslation[move['displayName']];
      move['displayType'] = move.type.toLowerCase().replace(/\b\w/g, function(l){ return l.toUpperCase() });
      move['localType'] = $scope.typesTranslation[move['displayType']];
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
				$scope.efficiencyTypes = data;
				$http.get('data/moves-translation-en-fr.json').success(function(data){
					$scope.movesTranslation = data;
					$http.get('data/pokemons-translation-fr.json').success(function(data){
						$scope.pokemonsTranslation = data;
            $http.get('data/types-translation-en-fr.json').success(function(data){
            $scope.typesTranslation = data;
            $scope.runTime();
          });
					});
				});
			});
		});
	});
});
