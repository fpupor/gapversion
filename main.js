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
				
				if(MyApp.VERSION && MyApp.VERSION > 0){
					confirm('Novas atualizações foram encontradas.\nDeseja atualizar agora?', function(response){
						if(response){
							MyApp.updateVersion();
						}else{
							MyApp.ready();
						}
					}, 'Sim', 'Não');
				}else{
					MyApp.updateVersion();
				}
			}else{
				MyApp.ready();
				return false;
			}
		},
		
		onUpdateVersion: function(){
			MyApp.MESSAGE = message('Aguardando servidor...');				
		},
		
		onUpdateCompareProgress: function(id, atual, ultimo){
			MyApp.MESSAGE = message('Comparando arquivos ' + atual + '/' + ultimo + '...');		
		},
		
		onUpdateStart: function(){
			MyApp.MESSAGE = message('Iniciando atualização...');				
		},
		
		onUpdateFileProgress: function(file, totalPercent){
			MyApp.MESSAGE.updateText('Baixando arquivo "' + file.name + '"...');
		},
		
		onUpdateProgress: function(file, atual, ultimo){
			MyApp.MESSAGE.updateText('Atualizando arquivos ' + atual + '/' + ultimo + '...');
		},
		
		onUpdateComplete: function(){
			if(MyApp.MESSAGE)
				MyApp.MESSAGE.hide();
			
			alert('As atualizações foram concluidas com sucesso!', function(){
				MyApp.ready();
			}, 'Brincar');
		},
		
		onUpdateError: function(ers){
			if(ers && ers == 'offline'){
				alert('Este é seu primeiro acesso ao aplicativo.\nPara fazer a primeira atualização é necessário estar conectado à internet.', function(){
					MyApp.checkVersion();
				}, 'Tentar novamente');
			}else{
				alert('Não foi possivel concluir as atualizações\nTente novamente mais tarde.', function(){
					MyApp.ready();
				}, 'Brincar');
			}
		},
		
		onErrorHandler: function(e){
			alert(e);
		}
	});

	
});