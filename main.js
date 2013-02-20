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
			MyApp.DEBUG.info('app ready');
			
			Loader.js(MyApp.FILESYSTEM.fullPath + '/Assets/js/init.js', function(){
				MyApp.DEBUG.info('init.js include');
			}, function(e){
				MyApp.errorHandler('init.js include', e);
			});
			
			Loader.css(MyApp.FILESYSTEM.fullPath + '/Assets/css/style.css', function(){
				MyApp.DEBUG.info('style.css include');
			}, function(e){
				MyApp.errorHandler('style.css include', e);
			});
		},
		
		onCheckVersion: function(newVersion){
			if(newVersion && confirm('Novas atualizações foram encontradas.\nVoce deseja atualizar agora?')){
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