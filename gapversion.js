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
						fileEntry.createWriter(function(writer){
							writer.write("0");
						});
						
						such.VERSION = 0;
					}
					
					callback(such.VERSION);
				}, function(e){
					such.errorHandler('open user version', e);
				})
			}, function(){
				such.errorHandler('get user version', e);
			});
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
					fileEntry.getMetadata(function(metadata){
						var nowFileDate = new Date(metadata.modificationTime);
						
						if(nowFileDate.getTime() < fileDate.getTime())
							such.updateFile(uriPath, localPath);
							
					}, function(){
						such.errorHandler('error getMetadata' , e);
					});
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
					complete();
				}, function(e){
					such.errorHandler('nao baixou arquivo\n'+uriPath, e);
					complete();
				}, function(e){
					//if (e.lengthComputable) {
						such.updateFileProgress(fileEntry, (e.loaded / e.total) * 100);
					//}
				});
			});
		},
		
		updateFileProgress: function(fileEntry, percent){
			such.options.onUpdateFileProgress(fileEntry, percent);
		},
		
		updateProgress: function(id){
			such.options.onUpdateProgress(id, (caller.LIST.length / caller.COMPLETES.length) * 100);
		},
		
		updateComplete: function(id){
			such.options.onUpdateComplete();
		},
		
		checkVersion: function(){
			if(!such.ONLINE)
				return such.DEBUG.info('offline to check version') && false;
				
			such.DEBUG.info('check version');
			
			such.downloadFile(such.options.SYSTEM, "Temp", function(fileEntry){
				such.DEBUG.info('download file version');
				
				such.openFile(fileEntry, function(file){
					such.DEBUG.info('open file version');
					such.UPDATES = such.parseProtocol(file.target.result);
					
					if(such.options.onCheckVersion(such.UPDATES.version > such.VERSION))
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
				files:[]
			};
			
			for(var l = 1; l < lines.length; l++){
				var file = lines[l].split('#');
				
				if(file.length > 0){
					if(file[0] != '' && file[1] != ''){
						output.files.push({
							name: file[0],
							timestamp: new Date(parseFloat(file[1]))
						});
					}
				}
			}
			
			return output;
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