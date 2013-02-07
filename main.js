deviceready.push(function(){
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
	
	document.addEventListener("online", function(){
		MyApp.online();
	}, false);
	
	document.addEventListener("offline", function(){
		MyApp.offline();
	}, false);
});