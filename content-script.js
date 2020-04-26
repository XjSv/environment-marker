(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  /**
   * Given a URL, background color create a ribbon and add it to the page.
   */
  function insertRibbon(color, url, label, position) {
    removeExistingRibbon();

    let ribbonWrapper = document.createElement('div'),
        textColor = getContrastYIQ(color);

    ribbonWrapper.className = 'ribbon-wrapper '+position+'-wrapper';

    let ribbon = document.createElement('div');
    ribbon.setAttribute('style', 'background-color: ' + color + '; color: ' + textColor + ';');
    ribbon.className = 'ribbon '+position+'-ribbon';
    ribbon.textContent = truncateString(label, 10);

    ribbonWrapper.appendChild(ribbon);

    document.body.appendChild(ribbonWrapper);
  }

  function truncateString(str, num) {
    if (str.length <= num) {
      return str
    }
    return str.slice(0, num) + '...'
  }

  function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace('#', '');
    var r = parseInt(hexcolor.substr(0, 2), 16),
        g = parseInt(hexcolor.substr(2, 2), 16),
        b = parseInt(hexcolor.substr(4, 2), 16),
        yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? 'black' : 'white';
  }

  /**
   * Remove the ribbon from the page.
   */
  function removeExistingRibbon() {
    let existingRibbons = document.querySelectorAll(".ribbon-wrapper");
    for (let ribbon of existingRibbons) {
      ribbon.remove();
    }
  }

  /**
   * Listen for messages from the background script.
   * Call "addRibbon()" or "reset()".
  */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "addRibbon") {
      insertRibbon(message.color, message.url, message.label, message.position);
    } else if (message.command === "reset") {
      removeExistingRibbon();
    }
  });

})();
