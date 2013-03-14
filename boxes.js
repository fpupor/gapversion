deviceready.push(function(){
	Boxes = new Class({
		GENERAL: null,
		BOX: null,
		MESSAGE: null,
		BUTTONS: null,
		BODY: null,
		VISIBLE: false,
		
		construct: function(options){
			such.options.callback.apply(such, [true]);
			return;
			such.options.message =  such.options.message + '';
			such.BODY = document.body;
			
			such.createDefaults();
			such.show();
			
			self.UID++;
		},
		
		createDefaults: function(){
			such.GENERAL = document.createElement('div');
			such.GENERAL.id = 'system-boxes-' + self.UID;
			such.GENERAL.className = 'system-boxes-' + such.options.type;
			such.GENERAL.style.visibility = 'hidden';
			
			such.BOX = document.createElement('div');
			such.BOX.className = 'box';
			
			such.MESSAGE = document.createElement('p');
			such.MESSAGE.className = 'message';
			
			such.BUTTONS = document.createElement('span');
			such.BUTTONS.className = 'buttons';
			
			if(such.options.okText){
				var ok = document.createElement('a');
					ok.className = 'btn-ok';
					ok.innerText = such.options.okText;
					ok.addEvent('click', function(){
						such.hide(true);
					});
				such.BUTTONS.appendChild(ok);
			}
			
			if(such.options.cancelText){
				var cancel = document.createElement('a');
					cancel.className = 'btn-cancel';
					cancel.innerText = such.options.cancelText;
					cancel.addEvent('click', function(){
						such.hide(false);
					});
				such.BUTTONS.appendChild(cancel);
			}	
			
			such.GENERAL.appendChild(such.BOX);
			such.BOX.appendChild(such.MESSAGE);
			such.BOX.appendChild(such.BUTTONS);
			
			such.updateText(such.options.message);
		},
		
		updateText: function(txt){
			such.MESSAGE.innerHTML = (txt || '').replace(/\n/gim, '<br/>');
			such.centerBox();
		},
		
		centerBox: function(){
			if(!such.VISIBLE)
				such.BODY.appendChild(such.GENERAL);
			
			var totalHeight = such.GENERAL.offsetHeight;
			var totalWidth = such.GENERAL.offsetWidth;
			
			var boxHeight = such.BOX.offsetHeight;
			var boxWidth = such.BOX.offsetWidth;
			
			such.BOX.style.top = ((totalHeight / 2) - (boxHeight / 2)) + 'px';
			such.BOX.style.left = ((totalWidth / 2) - (boxWidth / 2)) + 'px';
			
			if(!such.VISIBLE){
				such.GENERAL.parentNode.removeChild(such.GENERAL);
				such.GENERAL.style.visibility = 'visible';
			}
		},
		
		show: function(){
			such.VISIBLE = true;
			such.BODY.appendChild(such.GENERAL);
		},
		
		hide: function(status){
			such.VISIBLE = false;
			such.GENERAL.parentNode.removeChild(such.GENERAL);
			such.options.callback.apply(such, [status]);
		}
	},{
		defaults: {
			type: 'default',
			message: '',
			okText: null,
			cancelText: null,
			callback: function(){}
		},
		UID: 1
	});
	
	window['alert'] = function(message, callback, okText){
		return new Boxes({
			message: message,
			okText: okText || 'Ok',
			callback: callback
		})
	}
	
	window['confirm'] = function(message, callback, okText, cancelText){
		return new Boxes({
			message: message,
			okText: okText || 'Ok',
			cancelText: cancelText || 'Cancel',
			callback: callback
		})
	}
	
	window['message'] = function(message, callback){
		return new Boxes({
			type: 'message',
			message: message,
			callback: callback
		})
	}
});