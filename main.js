alert('init run');

document.addEventListener("deviceready", function(){
	alert('ready');
	
	var MyApp = new gapVersion({
		SERVER: 'http://hml.conheca.me/gapversion/',
		SYSTEM: 'system.php',

		onReady: function(){
			such.DEBUG.info('app ok');
		}
	});
	application.checkVersion();
}, false);

alert('runat');