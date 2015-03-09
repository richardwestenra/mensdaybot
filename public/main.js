$(function(){
	'use strict';
	var $action = $('#action');

	function update(data){
		if(!data) {
			return;
		}
		var tweets = data.backlog.map(function(d){
			var $li = $('<li>',{ text: d.text });
			$li.prepend(' <a class="hash" href="https://twitter.com/'+d.user.screen_name+'/status/'+d.id_str+'" target="_blank">#</a> ');
			$li.prepend('<button class="btn" data-id="'+d.id+'" id="reject">Ignore</button>');
			$li.prepend('<button class="btn" data-id="'+d.id+'" id="approve">Respond</button>');

			return $li;
		});
		$('#tweets').html(tweets);

		$('#mode').text(data.mode);
	}

	$('#tweets').on('click', 'button', function(e){
		var approve = $(this).attr('id') === 'approve';
		var params = {
			approve: approve,
			id: $(this).attr('data-id')
		};
		$action.text('');
		console.log(params);
		$.get( '/query', params, function(data) {
			update(data);
			$action.text(function(){
				return approve ? 'Reply sent.' : 'Tweet ignored.';
			});
		});
	});

	$('#mode').on('click', function(e){
		e.preventDefault();
		var params = {
			mode: $(this).text()
		};
		console.log(params);
		$action.text('');

		$.get( '/query', params, function(data) {
			update(data);
			$action.text('Bot mode changed to '+data.mode);
		});
	});

	$('#refresh').on('click', function(e){
		e.preventDefault();
		$action.html('Refeshing&hellip;');

		$.get( '/query', function(data) {
			update(data);
			$action.text('Refreshed!');
		});
	});

	$('#clear').on('click', function(e){
		e.preventDefault();
		$action.html('');

		$.get( '/query', {clear:'clear'}, function(data) {
			update(data);
			$action.text('Backlog emptied.');
		});
	});

	function refresh(){
		$.get( '/query', function(data) {
			update(data);
			$action.text('Backlog updated.');
		});
	}

	refresh();
	window.setInterval(refresh,10000); // refresh every 10 seconds
	
});
