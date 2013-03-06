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
			
			document.body.className = 'r' + screen.width + 'x' + screen.height;
			
			Loader.css(MyApp.FILESYSTEM.fullPath + '/Assets/css/style.css', function(){
				MyApp.DEBUG.info('style.css include');				
				
				MyApp.DEBUG.info('get content html');
				MyApp.getFile("Assets/content.html", function(fileEntry){
					
					MyApp.DEBUG.info('open content html');
					MyApp.openFile(fileEntry, function(file){
						
						MyApp.DEBUG.info('inner content html');
						document.getElementById('body').innerHTML = file.target.result;
						
						Loader.js(MyApp.FILESYSTEM.fullPath + '/Assets/js/init.js', function(){
							MyApp.DEBUG.info('init.js include');
						}, function(e){
							MyApp.errorHandler('init.js include', e);
						});
						
					}, function(e){
						MyApp.errorHandler('error open content html', e);
					})
				}, function(e){
					MyApp.errorHandler('error get content html', e);
				});
				
				
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
			document.getElementById('log').innerHTML = 'total fp ' + totalPercent;
		},
		
		onUpdateProgress: function(file, totalPercent){
			document.getElementById('log').innerHTML = 'total up ' + totalPercent;
			//alert('Update Progress');
		},
		
		onUpdateComplete: function(){
			alert('Update Complete');
			MyApp.ready();
		},
		
		onUpdateError: function(ers){
			alert('Update Error');
		},
		
		onErrorHandler: function(e){
			alert(e);
		}
	});

	
});