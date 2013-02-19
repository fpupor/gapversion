deviceready.push(function(){
	MyApp = new gapVersion({
		SERVER: 'http://hml.conheca.me/gapversion/',
		SYSTEM: 'system.php',
		ROOT: 'GapVersion',

		onConstruct: function(){
			document.addEventListener("online", MyApp.online, false);
			document.addEventListener("offline", MyApp.offline, false);
		},
		
		onReady: function(){
			MyApp.DEBUG.info('app ok');
			alert(MyApp.FILESYSTEM.fullPath);
			Loader.js(MyApp.FILESYSTEM.fullPath + '/Assets/js/init.js');
		},
		
		onCheckVersion: function(newVersion){
			if(confirm('Novas atualizações foram encontradas.\nVoce deseja atualizar agora?')){
				return true;
			}else{
				MyApp.ready();
				return false;
			}
		},
		
		onUpdateVersion: function(){
			alert('Update Start');
		},
		
		onUpdateFileProgress: function(file, totalPercent){
			document.getElementById('log').innerHTML = 'total p ' + totalPercent;
		},
		
		onUpdateProgress: function(file, totalPercent){
			document.getElementById('log').innerHTML = '';
			alert('Update Progress');
		},
		
		onUpdateComplete: function(){
			alert('Update Complete');
			MyApp.ready();
		},
		
		onUpdateError: function(){
			alert('Update Error');
		},
		
		onErrorHandler: function(e){
			alert(e);
		}
	});

	
});