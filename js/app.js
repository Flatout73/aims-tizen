( function () {
	
	function keyEventHandler(ev) {
		if( ev.keyName === "back" ) {
			var page = document.getElementsByClassName( 'ui-page-active' )[0],
				pageid = page ? page.id : "";
			if( pageid === "info" ) {
				try {
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	}
	function init() {
		
		window.addEventListener("tizenhwkey", keyEventHandler);
		
		var page = document.getElementById("main");
		var element = document.getElementById("sectionchanger");
		var sectionChanger, pageIndicator;
		var elPageIndicator = document.getElementById("pageIndicator");
	
        page.addEventListener("pagebeforeshow", function(evt)
                {
                   /* Create PageIndicator */
                   pageIndicator =  tau.widget.PageIndicator(elPageIndicator, {numberOfPages: 3});

                   sectionChanger = new tau.widget.SectionChanger(element,
                   {
                      circular: false,
                      orientation: "horizontal",
                      useBouncingEffect: true
                   });
                });
	
	
		page.addEventListener("pagehide", function() {
			sectionChanger.destroy();
			pageIndicator.destroy();
		});
		
		element.addEventListener("sectionchange", function(evt) {
			var header = document.getElementById("header");
			if(evt.detail.active === 1) {
				header.innerHTML = "Лента";
			}
			else if (evt.detail.active === 0) {
				header.innerHTML="Моя страница";
			}
			else {
				header.innerHTML = "Друзья";
			}
			pageIndicator.setActive(evt.detail.active);
		}, false);
	}
	
	window.onload = init();
} () );
