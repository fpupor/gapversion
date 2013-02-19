deviceready.push(function(){
	MyApp = new gapVersion({
		SERVER: 'http://hml.conheca.me/gapversion/',
		SYSTEM: 'system.php',
		ROOT: 'GapVersion',

		onConstruct: function(){
			document.addEventListener("online", such.online, false);
			document.addEventListener("offline", such.offline, false);
		},
		
		onReady: function(){
			such.DEBUG.info('app ok');
		},
		
		onCheckVersion: function(newVersion){
			return confirm('Novas atualizações foram encontradas.\nVoce deseja atualizar agora?');
		},
		
		onUpdateVersion: function(){
			alert('Update Start');
		},
		
		onUpdateFileProgress: function(file, totalPercent){
			document.getElementById('log').innerHTML = totalPercent;
		},
		
		onUpdateProgress: function(file, totalPercent){
			document.getElementById('log').innerHTML = '';
			alert('Update Progress');
		},
		
		onUpdateComplete: function(){
			alert('Update Complete');
		},
		
		onUpdateError: function(){
			alert('Update Error');
		},
		
		onErrorHandler: function(e){
			alert(e);
		}
	});

	
});