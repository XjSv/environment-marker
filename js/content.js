(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun || typeof browser == "undefined") {
    return;
  }
  window.hasRun = true;

  /**
   * Given a URL, background color create a ribbon and add it to the page.
   */
  function insertRibbon(color, url, label, fontSize, position, size, fontData) {
    removeExistingRibbon();
    removeExistingStylesheets();

    let ribbonWrapper = document.createElement('div'),
        ribbon = document.createElement('div'),
        ribbonText = document.createElement('div'),
        textColor = getContrastYIQ(color);

    // For backwards compatibility for users that already have ribbons configured.
    // @TODO: Remove sometime in the future
    if (fontSize === undefined) {
      fontSize = '14'
    }

    // For backwards compatibility for users that already have ribbons configured.
    // @TODO: Remove sometime in the future
    if (size === undefined) {
      size = 'normal'
    }

    ribbonWrapper.className = 'em-ribbon-wrapper em-' + position + '-wrapper em-' + size + '-ribbon-wrapper';
    ribbon.className = 'em-ribbon em-' + size + '-ribbon em-' + position + '-ribbon';
    ribbonText.className = 'em-ribbon-label';
    ribbonText.textContent = label;
    ribbon.appendChild(ribbonText);
    ribbonWrapper.appendChild(ribbon);

    if (fontData) {
      let fontTmp = fontData.split(':'),
          fontLocation = fontTmp[0],
          font = fontTmp[1],
          variant = fontTmp[2] || '400',
          weight = parseInt(variant,10),
          italic = /i$/.test(variant);

      ribbon.setAttribute('style',
          "background-color: " + color +
          "; color: " + textColor +
          "; font-size: " + fontSize +
          "px; font-family: '" + font +
          "'; font-weight: " + weight +
          "; font-style: " + (italic ? 'italic' : 'normal') + ";");

      if (fontLocation === 'google') {
        let googleFontStylesheet = document.createElement('link');
            googleFontStylesheet.href = 'https://fonts.googleapis.com/css?family=' + font + ':' + variant + '&display=swap';
            googleFontStylesheet.type = 'text/css';
            googleFontStylesheet.rel = 'stylesheet';
            googleFontStylesheet.className = 'em-google-stylesheet';

        document.head.appendChild(googleFontStylesheet);
      } else {
        let style = document.createElement('style');
        style.innerHTML = "@font-face { font-family:'" + font + "'; src:local('" + font + "'), url('/libraries/fontpicker/fonts/" + font + ".woff') format('woff'); }";
        document.head.appendChild(style);
      }
    } else {
      ribbon.setAttribute('style', "background-color: " + color + "; color: " + textColor + "; font-size: " + fontSize + "px;");
    }
    document.body.appendChild(ribbonWrapper);
  }

  function getContrastYIQ(hexColor) {
    hexColor = hexColor.replace('#', '');
    let r = parseInt(hexColor.substr(0, 2), 16),
        g = parseInt(hexColor.substr(2, 2), 16),
        b = parseInt(hexColor.substr(4, 2), 16),
        yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? 'black' : 'white';
  }

  /**
   * Remove any existing ribbons from the page.
   */
  function removeExistingRibbon() {
    let existingRibbons = document.querySelectorAll('.em-ribbon-wrapper');
    for (let ribbon of existingRibbons) {
      ribbon.remove();
    }
  }

  /**
   * Remove any stylesheets that have been previously injected from the page.
   */
  function removeExistingStylesheets() {
    let existingStylesheet = document.querySelectorAll('.em-google-stylesheet');
    for (let stylesheet of existingStylesheet) {
      stylesheet.remove();
    }
  }

  /**
   * Listen for messages from the background script.
   * Call "insertRibbon()" or "removeExistingRibbon()".
  */
  browser.runtime.onMessage.addListener( (message) => {
    if (message.command === 'addRibbon') {
      insertRibbon(message.color, message.url, message.label, message.fontSize, message.position, message.size, message.font);
    } else if (message.command === 'reset') {
      removeExistingRibbon();
      removeExistingStylesheets();
    }
    return Promise.resolve('done');
  });

})();
