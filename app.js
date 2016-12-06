var myApp = angular.module('myApp',[]);

//myApp.directive('myDirective', function() {});
//myApp.factory('myService', function() {});

function MyCtrl($scope, $filter,$http) {

		var efficiency;

		$scope.display=1;
    $scope.versus = {defensor: "",
    									pokeDefensor: null,
                      pokemons: []};
    //$scope.defensor = "Bulbasaur";
    //$scope.pokeDefensor = null;

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
    	if($scope.versus.defensor == ""){
      	$scope.versus.pokeDefensor = null;
      }else{
      	$scope.versus.pokeDefensor = $filter('filter')($scope.pokemons, {"Name":$scope.versus.defensor})[0];
        angular.forEach($scope.pokemons, function(pokemon){
		var defensorDmg = [];
        	angular.forEach($scope.versus.pokeDefensor['Quick Moves'], function(move){
          		defensorDmg.puch( Math.floor((((($scope.versus.pokeDefensor.BaseAttack+15)*move.power)/(pokemon.BaseDefense+15))/2)*($scope.stab($scope.versus.pokeDefensor, move)?1.25:1)*$scope.efficiency(move, pokemon))+1);
          	});
        	angular.forEach(pokemon['Quick Moves'], function(move){
          	var dmg = Math.floor(((((pokemon.BaseAttack+15)*move.power)/($scope.versus.pokeDefensor.BaseDefense+15))/2)*($scope.stab(pokemon, move)?1.25:1)*$scope.efficiency(move, $scope.versus.pokeDefensor))+1;
            $scope.versus.pokemons.push({Id: pokemon.Id, Name: pokemon.Name, Type1: pokemon.Type1, Type2: pokemon.Type2, BaseAttack: pokemon.BaseAttack, BaseDefense: pokemon.BaseDefense, BaseStamina: pokemon.BaseStamina, moveName: move.name, damage: dmg, dps: dmg/+(move.durationMS.replace(',', ''))*1000, income: defensorDmg});
          });
        });
      }
    };

		$scope.orderBy = function(value){
    	$scope.filter = value;
      $scope.reverse = !$scope.reverse;
    };

		$scope.filter = "Id";
    $scope.reverse = false;


		//__RUNTIME__
    $scope.runTime = function(){
        angular.forEach($scope.pokemons, function(pokemon){
          //pokemon.maxCP = pokemon["Max CP"];
          //pokemon.maxHP = pokemon["Max HP"];
          pokemon.sum = pokemon.BaseAttack + pokemon.BaseDefense + pokemon.BaseStamina;
          pokemon.prod = pokemon.BaseAttack * pokemon.BaseDefense * pokemon.BaseStamina;
          pokemon["Quick Moves"] = [];
          pokemon["Charge/Special Moves"] = [];
       });

       angular.forEach($scope.moves, function(move){
        angular.forEach(move.pokemons, function(id){
          var tmp = $filter('filter')($scope.pokemons, {Id: +id}, true);
          angular.forEach(tmp, function(pokemon){
            pokemon[move.category].push(move);
          });
        });
      });

    };//en runtime


    $http.get('data/pokemons.json').success(function(pokemons){
    	$scope.pokemons = pokemons;
      $http.get('data/moves.json').success(function(moves){
      	$scope.moves = moves;
        $http.get('data/efficiency.json').success(function(data){
          efficiency = data;
          $scope.runTime();
        });
      });
    });
}
