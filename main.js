alert('init run');

document.addEventListener("deviceready", function(){
	alert('ready');
	
	MyApp = new gapVersion({
		SERVER: 'http://hml.conheca.me/gapversion/',
		SYSTEM: 'system.php',

		onReady: function(){
			such.DEBUG.info('app ok');
		}
	});
	
	MyApp.checkVersion();
}, false);

alert('runat');