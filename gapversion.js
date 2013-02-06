var gapVersion  = new Class({
	ERRORS: [],
	FILESYSTEM: null,
	DEBUG: null,
	
	construct: function(options){
		such.DEBUG = new debug(true);
	
		such.setFileSystem();
	},
	
	setFileSystem: function(){
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
			such.FILESYSTEM = fileSystem;
		 }, function(e){
			such.DEBUG.error('request file system' , e);
		 });
	},
	
	waitFileSystem: function(callback){
		if(such.FILESYSTEM)
			return true;
		
		setTimeout(callback, 1000);
	},
	
	downloadFile: function(fileName, success, fail){
		var fileTransfer = new FileTransfer();
		var uri = encodeURI(such.options.SERVER + fileName);
	
		fileTransfer.download(uri, such.FILESYSTEM, success, fail || function(){});
	},
	
	
	openFile: function(entry, success, fail){
		entry.file(function(file){
			var fileReader = new FileReader();
			fileReader.onload = success;
			fileReader.onerror = fail || function(){};
			fileReader.readAsText(file);					
		}, fail || function(){});
	},
	
	
	checkVersion: function(){
		if(!such.checkNetwork() || !such.waitFileSystem(such.checkVersion))
			return;
			
		such.downloadFile(such.options.SYSTEM, function(entry){
			such.openFile(entry, function(e){
		
				
				such.DEBUG.info(e.target.result);
			}, function(e){
				such.DEBUG.error('open file system' , e);
			});
		}, function(e){
			such.DEBUG.error('download file system' , e);
		})
	},
	
	checkNetwork: function(){
		switch(navigator.connection.type){
			case self.NETWORK.ETHERNET:
			case self.NETWORK.CELL_2G:
			case self.NETWORK.CELL_3G:
			case self.NETWORK.CELL_4G:
			case self.NETWORK.WIFI:
				return true;
			break;
			default:
				return false;
		}
	}
},{
	defaults:{
		SERVER: null,
		SYSTEM: null,
		
		onReady: function(){}
	},
	
	NETWORK: {
		UNKNOWN	: 0,
		ETHERNET: 1,
		WIFI	: 2,
		CELL_2G	: 3,
		CELL_3G	: 4,
		CELL_4G	: 5,
		NONE	: undefined
	}
});