﻿deviceready.push(function(){
	gapVersion  = new Class({
		ERRORS: [],
		FILESYSTEM: null,
		DEBUG: null,
		ONLINE: false,
		fn: function(){},
		
		construct: function(options){
			such.DEBUG = new debug(true);
		},
		
		online: function(){
			alert('online');
		
			such.ONLINE = true;
			such.setFileSystem(such.checkVersion);
		},
		
		offline: function(){
			alert('offline');
		
			such.ONLINE = false;
			such.ready();
		},
		
		ready: function(){
			such.options.onReady();
		},
		
		setFileSystem: function(callback){
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
				such.FILESYSTEM = fileSystem;
				callback(fileSystem);
			 }, function(e){
				such.DEBUG.error('request file system' , e);
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
		
		
		checkVersion: function(){
			alert('check version');
			
			such.downloadFile(such.options.SYSTEM, "Assets", function(fileEntry){
				alert('Success download');
				
				such.openFile(fileEntry, function(file){
					alert('Success open');
					alert(file.target.result);
					such.DEBUG.info(file.target.result);
				}, function(e){
					alert('Error open');
					such.DEBUG.error('open file system' , e);
				});
			}, function(e){
				alert('Error download');
				such.DEBUG.error('download file system' , e);
			})
		}
	},{
		defaults:{
			SERVER: null,
			SYSTEM: null,
			
			onReady: function(){}
		}
	});
});