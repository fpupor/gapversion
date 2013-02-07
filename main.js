alert('init run');

MyApp = new gapVersion({
	SERVER: 'http://hml.conheca.me/gapversion/',
	SYSTEM: 'system.php',

	onReady: function(){
		such.DEBUG.info('app ok');
	}
});


document.addEventListener("deviceready", function(){

	alert(MyApp);
	
	MyApp.checkVersion();
	
	alert('runat');
}, false);