deviceready.push(function(){
	navigator.splashscreen.show();
	
	MyApp = new gapVersion({
		SERVER: 'http://hml.conheca.me/gapversion/',
		SYSTEM: 'system.php',
		ROOT: 'GapVersion',
		MESSAGE: null,
		
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
							
							setTimeout(function(){
								navigator.splashscreen.hide();
							}, 1000);
							
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
			if(newVersion){
				confirm('Novas atualizações foram encontradas.\nVoce deseja atualizar agora?', function(response){
					if(response){
						MyApp.updateVersion();
					}else{
						MyApp.ready();
					}
				});
			}else{
				MyApp.ready();
				return false;
			}
		},
		
		onUpdateVersion: function(){
			var txt = 'Aguarde estamos baixando as novas atualizações.\nNão feche o aplicativo.';
			if(!MyApp.MESSAGE)
				MyApp.MESSAGE = message(txt);
				
		},
		
		onUpdateFileProgress: function(file, totalPercent){
			document.getElementById('log').innerHTML = 'total fp ' + totalPercent;
		},
		
		onUpdateProgress: function(file, totalPercent){
			document.getElementById('log').innerHTML = 'total up ' + totalPercent;
			//alert('Update Progress');
		},
		
		onUpdateComplete: function(){
			if(MyApp.MESSAGE)
				MyApp.MESSAGE.hide();
			MyApp.ready();
		},
		
		onUpdateError: function(ers){
			alert('Não foi possivel fazer as atualizações\nTente novamente mais tarde.');
		},
		
		onErrorHandler: function(e){
			alert(e);
		}
	});

	
});