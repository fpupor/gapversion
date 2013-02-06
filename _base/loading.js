Loading = new Class.extend( Chain, {
	HASBACKGROUND: /url\((.+)\)/,
	REMOVEQUOTES: /"|'/gim,
	LOADED: [],
	
	defaults: {
        async: false,
        lastInFirstOut: false,
        onFinish: function () { },
        onComplete: function () { },
		selector: new RegExp('.*'),
		CSS: CSS,
		Loader: Loader
    },
	
	construct: function(){
		parent();
	},
	
	load: function(){
		$foreach(such.options.CSS.getEmbeds(), such.embedsIterator);
		$foreach(document.getElementsByTagName('img'), such.imgIterator);
		
		such.run();
	},
	
	embedsIterator: function (obj) {
		if (!obj.sheet || !obj.sheet.href)
			return;

		var path = such.getPath(obj.sheet.href);

		$foreach(obj.rules, such.ruleIterator);
	},
	
	ruleIterator: function (rule) {
		if(such.options.selector && !such.options.selector.test(rule.selectorText))
			return;
	
		try {
            if (rule && rule['style'] && rule['style']['backgroundImage']) {
				var match = rule.style.backgroundImage.match(such.HASBACKGROUND);
				
				if (match) {
					var src = match[1].replace(such.REMOVEQUOTES, '');
						src = src.search('http') != -1 ? src : path + src;

					if (such.LOADED.join(',').indexOf(src) == -1) {
						such.LOADED.push(src);

						such.add(function (complete) {
							such.options.Loader.img(src, complete, complete);
						});
					}
				}
			}
		}catch (e) {
			throw new Error('Erro na tentativa de ler a regra no css');
		}
	},
	
	imgIterator: function(img){
		if(img){
			such.add(function (complete) {
				such.options.Loader.img(img['getAttribute'] ? img.getAttribute('src') : img.src, complete, complete);
			});
		}
	},
	
	getPath: function(href){
		var path = href.split('/');
			path.pop();
			path = path.join('/') + '/';
		
		return path;
	}
});