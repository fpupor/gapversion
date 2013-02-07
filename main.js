deviceready.push(function(){
	alert('ready');
	MyApp = new gapVersion({
		SERVER: 'http://hml.conheca.me/gapversion/',
		SYSTEM: 'system.php',

		onReady: function(){
			such.DEBUG.info('app ok');
		}
	});

	
	document.addEventListener("click", function(){
		MyApp.DEBUG.alertAll();
	}, false);
	
	document.addEventListener("online", MyApp.online, false);
	document.addEventListener("offline", MyApp.offline, false);
	
	MyApp.checkNetwork();
	
	alert('ready end');
});