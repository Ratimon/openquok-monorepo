/** Load side panel assets only from this extension package (never relative to a web origin). */
(function bootstrapOpenQuokSidePanel() {
	const css = document.getElementById('openquok-sidepanel-css');
	if (css) {
		css.href = chrome.runtime.getURL('sidepanel.css');
	}

	const script = document.createElement('script');
	script.type = 'module';
	script.src = chrome.runtime.getURL('sidepanel.js');
	document.body.appendChild(script);
})();
