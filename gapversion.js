deviceready.push(function(){
	gapVersion  = new Class({
		UPDATES: null,
		ERRORS: [],
		FILESYSTEM: null,
		DEBUG: null,
		ONLINE: false,
		VERSION: 0,
		
		fn: function(){},
		
		construct: function(options){
			such.DEBUG = new debug(true);
			
			such.checkNetwork();
			
			such.setFileSystem(function(){
				such.getVersion(function(v){
					such.checkVersion();	
					such.options.onConstruct(v);
				});
			});
		},
		
		online: function(){
			return such.ONLINE = true;
		},
		
		offline: function(){
			return such.ONLINE = false;
		},
		
		checkNetwork: function(){
			switch(navigator.network.connection.type){
				case self.NETWORK.ETHERNET:
				case self.NETWORK.CELL_2G:
				case self.NETWORK.CELL_3G:
				case self.NETWORK.CELL_4G:
				case self.NETWORK.WIFI:
					return such.online();
				break;
				default:
					return such.offline();
			}
		},
		
		ready: function(){
			such.options.onReady();
		},
		
		setFileSystem: function(callback){
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
				such.FILESYSTEM = fileSystem.root;
				such.getDirectory(such.options.ROOT, function(fileSystemRoot){
					such.FILESYSTEM = fileSystemRoot;
					callback(fileSystemRoot);
				}, function(e){
					such.errorHandler('request real root' , e);
				}, true);
			 }, function(e){
				such.errorHandler('request root' , e);
			 });
		},
		
		getVersion: function(callback, fail){
			such.FILESYSTEM.getFile("version.txt", {
				create: true, 
				exclusive: false
			}, function(fileEntry){
				such.DEBUG.info('get user version');
				
				such.openFile(fileEntry, function(file){
					such.VERSION = parseFloat(file.target.result);
					
					if(such.VERSION == NaN){
						such.setVersion(0, fileEntry);
					}
					
					callback(such.VERSION);
				}, function(e){
					such.errorHandler('open user version', e);
				})
			}, function(){
				such.errorHandler('get user version', e);
			});
		},
		
		setVersion: function(version, fileEntry){
			if(fileEntry){
				such.VERSION = version;
				
				fileEntry.createWriter(function(writer){
					writer.write(version + '');
				}, function(e){
					such.errorHandler('set version', e);
				});
			}else{
				such.FILESYSTEM.getFile("version.txt", {
					create: true, 
					exclusive: false
				}, function(fileEntry){
					such.setVersion(version, fileEntry);
				});
			}
		},
		
		getDirectory: function(dirName, callback, fail, create, dirRoot){
			var dirList = dirName.split('/');
			var dirNow = dirList.shift();
			if(!dirRoot)
				var dirRoot = such.FILESYSTEM;
			
		
			if(dirNow != ''){
				dirRoot.getDirectory(dirNow, {
					create: create,
					exclusive: false
				}, function(dirEntry){
					if(dirList.length > 0)
						such.getDirectory(dirList.join('/'), callback, fail, create, dirEntry);
					else
						callback(dirEntry);
				}, fail);
			}else{
				callback(dirRoot);
			}
			
		},
		
		getFile: function(fileName, callback, fail, create){
			such.FILESYSTEM.getFile(fileName, {
				create: create,
				exclusive: false
			}, callback, fail);
		},
		
		downloadFile: function(filePathAndName, dirName, success, fail, loading){
			var fileTransfer = new FileTransfer();
			
			fileTransfer.onprogress = function(progressEvent) {
				if (progressEvent.lengthComputable) {
				  loading(true, progressEvent);
				} else {
				  loading(false);
				}
			};
			
			var tratament = (filePathAndName).split('/');
			var fileName = tratament.pop();
			var uri = encodeURI(such.options.SERVER + filePathAndName);
		
			such.getDirectory(dirName, function(dirEntry){
				fileTransfer.download(uri, dirEntry.fullPath + '/' + fileName, success, fail || such.fn);
			}, fail || such.fn, true);
		},
		
		
		openFile: function(fileEntry, success, fail){
			fileEntry.file(function(file){
				var fileReader = new FileReader();
				fileReader.onload = success;
				fileReader.onerror = fail || such.fn;
				fileReader.readAsText(file);					
			}, fail || such.fn);
		},
		
		updateVersion: function(){
			such.options.onUpdateVersion();
			
			var updates = such.UPDATES.files;
			
			for(var u = 0; u < updates.length; u++){
				var tratament = (updates[u].name).split('/');
					
				var fileName = tratament.pop();
				var filePath = tratament.join('/');
					filePath = filePath + ((filePath != '' && filePath.charAt(filePath.length-1) != '/') ? '/' : '');
					
				var fileDate = updates[u].timestamp;
				
				var uriPath = such.UPDATES.version.toFixed(1) + '/' + filePath + fileName;
				var localPath = 'Assets/' + filePath;
				
				such.getFile('Assets/' + filePath + fileName, function(fileEntry){					
					if(fileDate){
						fileEntry.getMetadata(function(metadata){
							
							var nowFileDate = new Date(metadata.modificationTime);
							
							if(nowFileDate.getTime() < fileDate.getTime())
								such.updateFile(uriPath, localPath);
							
							such.DEBUG.info(fileEntry.name + ' ' + nowFileDate.getTime() + ':' + fileDate.getTime());
							
						}, function(){
							such.errorHandler('error getMetadata' , e);
						});
					}else{
						fileEntry.remove(function(){
							such.DEBUG.info(fileEntry.name + ' deleted');
						}, function(){
							such.errorHandler('error remove file' , e);
						});
					}
				}, function(e){
					such.updateFile(uriPath, localPath);
				});
			}
			
			such.updateStart();
		},
		
		updateStart: function(){
			such.UPDATES.chain.run();
		},
		
		updateFile: function(uriPath, localPath){
			such.UPDATES.chain.add(function(complete){
				such.downloadFile(uriPath, localPath, function(fileEntry){
					such.DEBUG.info('update complete: '+localPath);
					complete();
				}, function(e){
					such.errorHandler('nao baixou arquivo\n'+uriPath, e);
					such.UPDATES.error.push(e);
					complete();
				}, function(e){
					if (e.lengthComputable) {
						such.updateFileProgress(fileEntry, (e.loaded / e.total) * 100);
					}
				});
			});
		},
		
		updateFileProgress: function(fileEntry, percent){
			such.options.onUpdateFileProgress(fileEntry, percent);
		},
		
		updateProgress: function(id){
			such.options.onUpdateProgress(id, 0);//(caller.LIST.length / caller.COMPLETES.length) * 100
		},
		
		updateComplete: function(id){
			if(such.UPDATES.error.length > 0){
				such.options.onUpdateError(such.UPDATES.error);
			}else{
				such.setVersion(such.UPDATES.version);
				such.options.onUpdateComplete();
			}
		},
		
		checkVersion: function(force){
			if(!such.ONLINE){
				if(such.VERSION && such.VERSION > 0)
					setTimeout(such.ready, 500);
					
				return such.DEBUG.info('offline to check version') && false;
			}
				
			such.DEBUG.info('check server version');
			
			such.downloadFile(such.options.SYSTEM, "Temp", function(fileEntry){
				such.DEBUG.info('download file version');
				
				such.openFile(fileEntry, function(file){
					
					such.UPDATES = such.parseProtocol(file.target.result);
					
					var updateNow = !such.VERSION || such.VERSION == NaN || such.VERSION == 'NaN' || such.UPDATES.version > such.VERSION;
					
					such.DEBUG.info('compare version '+updateNow+' last:'+ such.VERSION + ' new:' + such.UPDATES.version);
					
					if(force || such.options.onCheckVersion(updateNow))
						such.updateVersion();
				}, function(e){
					such.errorHandler('open file version' , e);
				});
			}, function(e){
				such.errorHandler('download file version' , e);
			})
		},
		
		errorHandler: function(txt, e){
			such.DEBUG.error(txt, e);
			such.options.onErrorHandler(txt, e);
		},
		
		parseProtocol: function(txt){
			if(!txt || txt == '')
				return [];
		
			var lines = txt.split('\n');
			var output = {
				chain: new Chain({
					onComplete: such.updateProgress,
					onFinish: such.updateComplete
				}),
				version: parseFloat(lines[0]) || 0,
				files:[],
				error:[]
			};
			
			for(var l = 1; l < lines.length; l++){
				var file = lines[l].split('#');
				
				if(file.length > 0){
					if(file[0] != '' && file[1] != ''){
						output.files.push({
							name: file[0],
							timestamp: file[1] == '0' ? false : new Date(parseFloat(file[1]))
						});
					}
				}
			}
			
			return output;
		},
		
		_error: function(e){
			try{
				such.errorHandler('class error', e);
			}catch(er){
				alert('crash');
				return false;
			}
			return false;
		}
	},{
		defaults:{
			SERVER: null,
			SYSTEM: null,
			ROOT: 'GapVersion',
			
			onConstruct: function(){},
			onReady: function(){},
			onCheckVersion: function(){},
			onUpdateVersion: function(){},
			onUpdateFileProgress: function(){},
			onUpdateProgress: function(){},
			onUpdateComplete: function(){},
			onUpdateError: function(){},
			onErrorHandler: function(){}
		},
		
		NETWORK: {
			UNKNOWN	: Connection.UNKNOWN,
			ETHERNET: Connection.ETHERNET,
			WIFI	: Connection.WIFI,
			CELL_2G	: Connection.CELL_2G,
			CELL_3G	: Connection.CELL_3G,
			CELL_4G	: Connection.CELL_4G,
			NONE	: Connection.NONE
		}
	});
});