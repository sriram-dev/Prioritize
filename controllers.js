var app = angular.module("Prioritize", ['ui.bootstrap']);

app.controller("MainController", ['$scope' , '$location' , 'MainService', function($scope, $location, MainService) {
	$scope.deparr = [];
	$scope.dep1;
	$scope.dep2;
	$scope.depGraph = [];
	$scope.AddDependency = function() {
		console.log("dep1 " + $scope.dep1 + " dep2 : " + $scope.dep2);
		var i=0;
		for(var i=0;i<$scope.depGraph.length;i++) {
			if($scope.depGraph[i].node === $scope.dep1)
				break;
		}		
		if(i === $scope.depGraph.length) {
			var obj = {node: $scope.dep1, deps: []};
			obj.deps.push($scope.dep2);
			$scope.depGraph.push(obj);
			$scope.deparr.push($scope.dep1);
			if($scope.deparr.indexOf($scope.dep2) == -1) {
				$scope.deparr.push($scope.dep2);
				var obj = {node: $scope.dep2, deps: []};
				$scope.depGraph.push(obj);
			}
		} else {
			// it shld already be in graph
			for(var i=0;i<$scope.depGraph.length;i++) {
				if($scope.depGraph[i].node === $scope.dep1) {
					if($scope.depGraph[i].deps.indexOf($scope.dep2) == -1) {
						$scope.depGraph[i].deps.push($scope.dep2);
					}
					break;
				}
			}
			if($scope.deparr.indexOf($scope.dep2) == -1) {
				$scope.deparr.push($scope.dep2);
				var obj = {node: $scope.dep2, deps: []};
				$scope.depGraph.push(obj);
			}
		}
	}

	$scope.closeAlert = function(node1, node2) {
		console.log("In close alert for " + node1 + ", " + node2);
		for(var i=0;i<$scope.depGraph.length;i++) {
			if($scope.depGraph[i].node === node1) {
				if($scope.depGraph[i].deps.indexOf(node2) !== -1) {
					$scope.depGraph[i].deps.splice($scope.depGraph[i].deps.indexOf(node2), 1);
					//if($scope.depGraph[i].deps.length === 0) {
						// remove both from and to
					//	$scope.depGraph.splice(i,1);						
					//}
				}
			}
		}
	}

	$scope.containsCycle = false;	
	$scope.connected_components = [];
	$scope.dfs_num = [];
	$scope.dfs_low = [];
	$scope.visited = [];
	$scope.dfs_number_counter = 0;
	$scope.componentStack = [];
	$scope.SCC_components = [];
	$scope.TopSortReverseOrder = [];
	$scope.TopSortOrder = [];
	$scope.node_to_index = new Object();
	$scope.TarjanSCC = function(index) {
		$scope.dfs_num[index] = $scope.dfs_low[index] = $scope.dfs_number_counter;
		$scope.dfs_number_counter++;
		$scope.componentStack.push(index);
		$scope.visited[index] = 1;
		for(var i=0;i<$scope.depGraph[index].deps.length;i++) {
			var cur_dep = $scope.node_to_index[$scope.depGraph[index].deps[i]];
			if($scope.dfs_num[cur_dep] == 0) {
				$scope.TarjanSCC(cur_dep);
			}
			if($scope.visited[cur_dep] == 1) {
				$scope.dfs_low[index] = Math.min($scope.dfs_low[index], $scope.dfs_low[cur_dep]);
			}
		}
		if($scope.dfs_low[index] == $scope.dfs_num[index]) {
			console.log("Printing a SCC now --- ");
			var comparr = [];
			while(1) {				
				var v = $scope.componentStack.pop();
				$scope.visited[v] = 0;
				console.log("Node : " + v);
				comparr.push(v);
				if(v == index) {
					console.log("adding comparr to SCC");
					console.log(comparr);
					$scope.SCC_components.push(comparr);
					break;
				}
			}
		}
	}
	$scope.FindConnectedComponents = function() {
		$scope.dfs_number_counter = 0;
		$scope.componentStack = [];
		console.log("in find connected components length of depgraph " +  $scope.depGraph.length);
		for(var i=0;i<$scope.depGraph.length;i++) {
			if($scope.dfs_num[i] == 0) {
				$scope.TarjanSCC(i);
			}
		}
		$scope.SCC_components.reverse();
	}

	$scope.InitializeArray = function(val, len) {
		var arr = new Array(len);
		for(var i=0; i< arr.length;i++) {
			arr[i] = val;
		}
		return arr;
	}

	$scope.CheckCycleExists = function() {
		for(var i=0;i<$scope.SCC_components.length;i++) {
			if($scope.SCC_components[i].length > 1) {
				console.log("Cycle found !");
				return 1;
				break;
			}
		}
		return 0;
	}

	$scope.TopSortDAG = function() {
		for(var i=0;i<$scope.depGraph.length;i++) {
			if($scope.dfs_num[i] == 0) {
				console.log("Calling TopSortDAGUtil with " + $scope.depGraph[i].node);
				$scope.TopSortDAGUtil(i);
			}
		}
	}

	$scope.TopSortDAGUtil = function(index) {
		$scope.dfs_num[index] = 1;
		for(var i=0;i<$scope.depGraph[index].deps.length;i++) {
			var cur_dep = $scope.node_to_index[$scope.depGraph[index].deps[i]];
			if($scope.dfs_num[cur_dep] == 0) {
				$scope.TopSortDAGUtil(cur_dep);
			}
		}
		$scope.TopSortReverseOrder.push(index);
	}

	/* Helper to debug */
	$scope.PrintDepGraph  = function() {
		console.log("DEP GRAPH ");
		for(var i=0;i<$scope.depGraph.length;i++) {
			console.log($scope.depGraph[i].node + " ---> ");
			for(var j=0;j<$scope.depGraph[i].deps.length;j++) {
				console.log($scope.depGraph[i].deps[j]);
			}
		}
	}

	$scope.Order = function() {
		$scope.connected_components = [];
		$scope.containsCycle = false;			
		$scope.dfs_number_counter = 0;
		$scope.componentStack = [];
		$scope.SCC_components = [];
		$scope.TopSortReverseOrder = [];
		$scope.TopSortOrder = [];
		// 1) Check if Graph contains Cycles -- using Tarjan
		// 2) If no cycle, do straight topological Sort
		// 3) If it contains cycle, Use GRASP Technique to find minimum feedback vertex set 
		$scope.dfs_num = $scope.InitializeArray(0, $scope.deparr.length);
		$scope.dfs_low = $scope.InitializeArray(0, $scope.deparr.length);
		$scope.visited = $scope.InitializeArray(0, $scope.deparr.length);

		for(var i=0;i<$scope.depGraph.length;i++) {
			$scope.node_to_index[$scope.depGraph[i].node] = i;
		}
		$scope.PrintDepGraph();
		$scope.FindConnectedComponents();
		//init $scope.dfs_num back to zero a it will be used by topsort next
		for(var i=0;i<$scope.dfs_num.length;i++)
			$scope.dfs_num[i] = 0;
		if($scope.CheckCycleExists() === 1) {
			$scope.containsCycle = true;
			console.log("Cycle Found --");
		} else {
			$scope.containsCycle = false;
			$scope.TopSortDAG();
		}
		console.log("Top Order -- ");
		for(var i=$scope.TopSortReverseOrder.length-1;i>=0;i--) {
			console.log($scope.depGraph[$scope.TopSortReverseOrder[i]].node);
		}
		$scope.TopSortReverseOrder.reverse();
	}

}]);