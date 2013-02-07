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
				such.FILESYSTEM = fileSystem;
				callback(fileSystem);
			 }, function(e){
				such.errorHandler('request root' , e);
			 });
		},
		
		getVersion: function(callback, fail){
			such.FILESYSTEM.root.getFile("version.txt", {
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
		
		getDirectory: function(dirName, callback, fail, create){
			such.FILESYSTEM.root.getDirectory(dirName, {
				create: create,
				exclusive: false
			}, callback)
		},
		
		downloadFile: function(fileName, dirName, success, fail){
			var fileTransfer = new FileTransfer();
			var uri = encodeURI(such.options.SERVER + fileName);
		
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
			var updates = such.UPDATES.files;
			
			for(var u = 0; u < updates.length; l++){
				alert(updates[u].name + ' : ' + updates[u].timestamp)
			}
			
			such.options.onUpdateVersion();
		},
		
		checkVersion: function(){
			if(!such.ONLINE)
				return such.DEBUG.info('offline to check version') && false;
				
			such.DEBUG.info('check version');
			
			such.downloadFile(such.options.SYSTEM, "Assets", function(fileEntry){
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
				version: parseFloat(lines[0]) || 0,
				files:[]
			};
			
			for(var l = 1; l < lines.length; l++){
				var file = lines[l].split('#');
				
				if(file.length > 0){
					output.files.push({
						name: file[0],
						timestamp: file[1]
					});
				}
			}
			
			return output;
		}
	},{
		defaults:{
			SERVER: null,
			SYSTEM: null,
			
			onConstruct: function(){},
			onReady: function(){},
			onCheckVersion: function(){},
			onUpdateVersion: function(){},
			onUpdateProgress: function(){},
			onUpdateComplete: function(){},
			onUpdateError: function(){}
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