var application = new gapVersion({
	SERVER: 'http://hml.conheca.me/gapversion/',
	SYSTEM: 'system.php',

	onReady: function(){
		such.DEBUG.info('app ok');
	}
});

document.addEventListener("deviceready", application.checkVersion, false);