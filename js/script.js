// ToDo:
// Визуализация алгоритма: перенести ховер-эвент с ячейки таблицы на спан с шагом
// Сохранение своих пресетов алгоритма и возможность их подгрузки
// Меню для загрузки заданий ЕГЭ
$(document).ready(function(){
	// Begin reset
		function resetField( resetTested ) {
			$(".path,.start").removeClass("path start").html("");
			$(".main td").unbind("mouseenter mouseleave");
			if(resetTested){
				$(".main td").css("background-color", "");
				$("#release").slideUp();
				window.tested = false;
			}
			return true;
		}
	// End reset

	// Begin algorithm create
	function createAlgo(){
		var algorithm = [];
		var error = false;
		$(".options > .algorithm").each(function(){
			var aCheck = $(this).find(".condition").val();
			var aType = $(this).find(".condition").attr("data-type");
			var aDo = $(this).find(".do").val();
			var aIsFree = $(this).find(".isfree").val();
			if(aCheck === null || aDo === null || aIsFree === null || aType === null){
				error = true;
				return
			}
			if(aIsFree == "true"){
				aIsFree = true;
			}else{
				aIsFree = false;
			}
			algorithm.push([ aCheck, aDo, aIsFree, aType ]);
		});
		if(error){
			return false
		}
		return algorithm;
	}
	// End algorithm create

	// Begin create obstacle
	function createObstacle( obstacle, $element, $elementIndex ){
		switch( obstacle ){
			case "right":
				if( $elementIndex != 5 ){
					$element
					.toggleClass("right")
					.next()
					.toggleClass("left");
				}
				break;
			case "left":
				if( $elementIndex != 0 ){
					$element
					.toggleClass("left")
					.prev()
					.toggleClass("right");
				}
				break;
			case "top":
				if( $element.parent().index() != 0 ){
					$element
					.toggleClass("top")
					.parent().prev().children("td:eq("+$elementIndex+")")
					.toggleClass("bottom");
				}
				break;
			case "bottom":
				if( $element.parent().index() != 5 ){
					$element
					.toggleClass("bottom")
					.parent().next().children("td:eq("+$elementIndex+")")
					.toggleClass("top");
				}
				break;
			default:
				break;
		}
		return true;
	}
	// End create obstacle

	// Begin test each cell based on algorithm
	function testCells( algorithm, visualizeOneCell ){

		$( (visualizeOneCell) ? (visualizeOneCell) : ".main td" ).each(function(){
			var $startCell = $(this);
			var $currentCell = $startCell;
			var isFailed = false;
			var currentCellClass = $currentCell.attr("class");
			var i = 0;
			var startCell = true;
			algorithm.forEach(function(value, index, array){
				while( ( (value[2]) ? (!currentCellClass || currentCellClass.indexOf(value[0]) == -1) : (currentCellClass && currentCellClass.indexOf(value[0]) > -1) ) && !isFailed){
					if(currentCellClass && currentCellClass.indexOf(value[1]) > -1){
						$startCell.css("background-color", "#CC0000");
						isFailed = true;
					}

					if(visualizeOneCell && !startCell){
						$currentCell.addClass("path").append( " " + ((isFailed)?"":++i) );
						$currentCell.on({ mouseenter : function(){
							$(".options .algorithm[data-id="+(index+1)+"]").addClass("visual");
						}, mouseleave : function(){
							$(".options .algorithm[data-id="+(index+1)+"]").removeClass("visual");
						} });
					};

					if(visualizeOneCell && startCell){
						$startCell.append( (isFailed)?"":i );
						$startCell.on({ mouseenter : function(){
							$(".options .algorithm[data-id="+(index+1)+"]").addClass("visual");
						}, mouseleave : function(){
							$(".options .algorithm[data-id="+(index+1)+"]").removeClass("visual");
						} });
						if(isFailed){
							return;
						}
						startCell = false;
					};
					if(isFailed){
						return;
					}
					switch(value[1]){
						case "right":
							$currentCell = $currentCell.next();
							break;
						case "left":
							$currentCell = $currentCell.prev();
							break;
						case "top":
							var $currentCellIndex = $currentCell.index();
							$currentCell = $currentCell.parent().prev().children().eq($currentCellIndex);
							break;
						case "bottom":
							var $currentCellIndex = $currentCell.index();
							$currentCell = $currentCell.parent().next().children("td:eq("+$currentCellIndex+")");
							break;
						default:
							break;
					}
					currentCellClass = $currentCell.attr("class");
					if(value[3] == "if"){
						return;
					}

				}
			});
			if(!isFailed){
				$startCell.css("background-color", "#00EE00");
				/*if(visualizeOneCell){
					$currentCell.on({ mouseenter : function(){
						$(".options .algorithm[data-id="+algorithm.length+"]").addClass("visual");
					}, mouseleave : function(){
						$(".options .algorithm[data-id="+algorithm.length+"]").removeClass("visual");
					} });
				}*/
				// Highligths last algorithm part on ending cell hover if it is successful (now highlights nothing)
			}
			if(visualizeOneCell){
				$currentCell.addClass("path").append('<font color="'+ (isFailed ? '#CC0000">' : '#00DD00">' ) + ((startCell) ? i : ++i) + '!</font>');
			}
		});
		return true;
	}
	// End test each cell based on algorithm

	// Begin Obstacles user create & path showing
	$(document).on("click", ".main td", function( e ){
		if( $(this).hasClass("start") ){
			$(".path,.start").mouseleave().unbind("mouseenter mouseleave").removeClass("path start").html("");
			return;
		}
		if( window.tested ){
			resetField(false);
			$(this).addClass("start");
			var algorithm = createAlgo();
			if(!algorithm){
				return;
			}
			testCells( algorithm, $(this) );
			$(this).mouseenter();
			return;
		}
		var Xcoord = (e.offsetX || e.clientX - $(e.target).offset().left);
		var Ycoord = (e.offsetY || e.clientY - $(e.target).offset().top);
		var obstaclesArr = [];

		if( Xcoord > 45 ){
			obstaclesArr.push("right");
		}else if( Xcoord < 5 ){
			obstaclesArr.push("left");
		}
		if( Ycoord > 45 ){
			obstaclesArr.push("bottom");
		}else if ( Ycoord < 5 ){
			obstaclesArr.push("top");
		}
		if(obstaclesArr != ''){
			var $targetedElement = $(this);
			var $targetedElementIndex = e.target.cellIndex;

			obstaclesArr.forEach(function( value, index, array ){
				createObstacle( value, $targetedElement, $targetedElementIndex );
			})

		}
	});
	// End Obstacles user create

	// Begin Start Algorithm Usage
	$(document).on("click", "#start", function(){
		resetField(false);
		var algorithm = createAlgo();
		if(!algorithm){
			return
		}
		window.tested = testCells( algorithm );
		if(window.tested){
			$("#release").slideDown();
		}
	});
	// End Start Algorithm Usage

	// Begin EGE Template Load
	$(document).on("click", "#ege", function(){
		resetField(true);
		$(".main table").html($(".ege_table table").html());
		$(".options hr").nextAll().remove();
		$(".options").append($(".ege_algo").html());
		window.algorithmInputs = 4;
	});
	// End EGE Template Load

	// Begin Random Obstacles Generate
	$(document).on("click", "#randomize", function(){
		resetField(true);
		var obstaclesCounter = 0;
		while(obstaclesCounter < 5 && $(".main td:not(.right.left.top.bottom)").length != 0){
			var obstaclePos = Math.floor(Math.random() * (4));
			switch( obstaclePos ){
				case 0:
					var obstacle = "right";
					break;
				case 1:
					var obstacle = "left";
					break;
				case 2:
					var obstacle = "top";
					break;
				case 3:
					var obstacle = "bottom";
					break;
				default:
					break;
			}
			var notClutteredCount = $(".main td:not(."+obstacle+")").length;
			if(notClutteredCount == 0){
				continue;
			}
			var selectCellEQ = Math.floor(Math.random() * notClutteredCount);
			var $selectCellObject = $(".main td:not(."+obstacle+")").eq(selectCellEQ);
			selectCellIndex = $selectCellObject.index();

			if(createObstacle(obstacle, $selectCellObject, selectCellIndex)){
				obstaclesCounter++;
			}
		}
	});
	// End Random Obstacles Generate

	// Begin Reset
	$(document).on("click", ".reset", function(){
		resetField(true);
		if($(this).hasClass("reset_field")){
			$(".main table").html($(".reset table").html());
		}
		/*if($(this).hasClass("reset_algo")){
			$(".options hr").nextAll().remove();
			$(".options").append($(".resetalgo").html());
			window.algorithmInputs = 2;
		}*/
		// If uncommenting this, uncomment button in index.html
	});
	// End Reset

	// Begin release hovering and switch to editing
	$(document).on("click", "#release", function(){
		resetField(true);
	});
	// End release hovering and switch to editing

	// Begin add condition to algorithm
 	window.algorithmInputs = 2;
 	$(document).on("click", "button.morealgo", function(){
 		resetField(true);
 		var type = $(this).attr("data-type");
 		$(".morealgo_"+type)
 		.clone()
 		.appendTo(".options")
 		.removeClass("morealgo_"+type)
 		.addClass("algorithm")
 		.attr("data-id", ++algorithmInputs)
 		.slideDown(500)
 		.find(".algocounter,.lessalgo")
 		.each(function(){
 			if($(this).hasClass("algocounter")){
 				$(this).text(algorithmInputs + ".").attr("data-id", algorithmInputs);
 			}else{
 				$(this).attr("data-id", algorithmInputs);
 			}
 		});
 	});
	// End add condition to algorithm

 	// Begin remove condition from algorithm
 	$(document).on("click", "img.lessalgo", function(){
 		$(this).prop("disabled", true);
 		resetField(true);
 		var id = parseInt($(this).attr("data-id"));
 		var $this = $(this).parent();
 		window.algorithmInputs--;
 		$this.nextAll().find("*[data-id]").addBack().each(function(){
 			$(this).attr("data-id", $(this).attr("data-id") - 1);
 			if($(this).hasClass("algocounter")){
 				$(this).text($(this).attr("data-id") + ".");
 			}
 		});
 		$this.remove();
 	});
	// End remove condition from algorithm
});