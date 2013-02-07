deviceready.push(function(){
	MyApp = new gapVersion({
		SERVER: 'http://hml.conheca.me/gapversion/',
		SYSTEM: 'system.php',

		onReady: function(){
			such.DEBUG.info('app ok');
		}
	});

	
	document.addEventListener("online", function(){
		MyApp.online();
	}, false);
	document.addEventListener("offline", function(){
		MyApp.offline();
	}, false);
});