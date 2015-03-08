console.log('Hello, world!');

$(function(){


	$('#search').on('keyup', function(e){
		if(e.keyCode === 13) {
			var parameters = { search: $(this).val() };
			$.get( '/query',parameters, function(data) {
				$('#results').html(data);
			});
		};
	});

	$.get( '/query', function(data) {
		$('#results').html(data);
	});
	
});
