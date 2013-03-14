deviceready.push(function(){
	document.body.className = 'r' + screen.width + 'x' + screen.height;
	
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
							
							navigator.splashscreen.hide();
							
							if(MyApp.MESSAGE)
								MyApp.MESSAGE.hide();
							
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
				navigator.splashscreen.hide();
				
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
			MyApp.MESSAGE = message('Aguardando servidor...');				
		},
		
		onUpdateFileProgress: function(file, totalPercent){
			MyApp.MESSAGE.updateText('Baixando novas arquivos...');
		},
		
		onUpdateProgress: function(file, totalPercent){
			MyApp.MESSAGE.updateText('Verificando arquivos desatualizados...');
		},
		
		onUpdateComplete: function(){
			if(MyApp.MESSAGE)
				MyApp.MESSAGE.hide();
			
			alert('As atualizações foram concluidas com sucesso!', function(){
				MyApp.ready();
			});
		},
		
		onUpdateError: function(ers){
			alert('Não foi possivel concluir as atualizações\nTente novamente mais tarde.', function(){
				MyApp.ready();
			});
		},
		
		onErrorHandler: function(e){
			alert(e);
		}
	});

	
});