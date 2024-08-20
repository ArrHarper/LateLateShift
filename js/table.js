$(document).ready(function() {
	var properties = [
		'manager',
		'team',
		'keeper',
		'cost',
		'years',
	];
	
	$.each( properties, function( i, val ) {
		
		var orderClass = '';
	
		$(".header__item #" + val).click(function(e){
			e.preventDefault();
			$('.filter__link.filter__link--active').not(this).removeClass('filter__link--active');
			  $(this).toggleClass('filter__link--active');
			   $('.filter__link').removeClass('asc desc');
	
			   if(orderClass == 'desc' || orderClass == '') {
					$(this).addClass('asc');
					orderClass = 'asc';
			   } else {
				   $(this).addClass('desc');
				   orderClass = 'desc';
			   }
	
			var parent = $(this).closest('.header__item');
			var index = parent.index();
			var $table = parent.closest('.tabletm');
			var rows = $table.find('.table-row').get();
			var isSelected = $(this).hasClass('filter__link--active');
			var isNumber = $(this).hasClass('filter__link--number');
				
			rows.sort(function(a, b){
	
				var x = $(a).find('.table-data').eq(index).text();
				var y = $(b).find('.table-data').eq(index).text();
					
				if(isNumber == true) {
					
					// Remove any non-numeric characters (except decimal point) for proper sorting
					x = parseFloat(x.replace(/[^\d.-]/g, ''));
					y = parseFloat(y.replace(/[^\d.-]/g, ''));
							
					if(isSelected) {
						return x - y;
					} else {
						return y - x;
					}
	
				} else {
				
					if(isSelected) {		
						if(x < y) return -1;
						if(x > y) return 1;
						return 0;
					} else {
						if(x > y) return -1;
						if(x < y) return 1;
						return 0;
					}
				}
				});
	
			$table.find('.table-content').empty().append(rows);
	
			return false;
		});
	
	});
	});