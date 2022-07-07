function MrPopUp(obj) {
  const dataSinkId = "mrPopup";

  /**
   * This function takes a single object with parameters
   * @param {Object} name String The name of the pop up, an identifier to be used for the browser
   * @param {Object} content The Element of pop up takes jQuery object or vanilla
   * @param {Object} settings Settings object
   * @param {Object} settings.timeout [Number]ms or [string] 1s Show pop up in X miliseconds
   * @param {Object} settings.scrollPercent [Number] Show pop up when X amount of page is scrolled
   * @param {Object} settings.session [True / false] remember if its dismissed per session, False per browser
   * @param {Object} settings.speed [Number]ms or [string] 1s, Speed of the show/hide animation speed
   * @param {Object} settings.fullScreen [True / False] Be a modal true / false a small popup in the page
   * @param {Object} settings.closeBtnColor The close icon colour
   * @param {Object} settings.callToAction [Class name] used for CTA buttons, clicking these will close the popup
   * @param {Object} settings.defaultCSS [True / False] use default CSS or not
   * An example object bellow:
   * {
   * name: 'apopupname',
   * content: $('#mypopup'),
   * settings: {
   *    timeout: 0, => No timeout
   *    scrollPercent: 80, => After scrolling 80% of the page display
   *    session: true, => popup will be saved per session
   *    callToAction: 'calltoaction', => When an element with the class calltoaction
   *    defaultCSS: false, => The script will not output any CSS
   *  }
   * }
   */

  function hasWhitespace(str) {
    return /\s/.test(str);
  }
  // Check if input is right unit: number (miliseconds) or string "12s" (seconds)
  function timeUnitCheck(input) {
    if (typeof input === "number" && input >= 0) return input;
    if (typeof input === "string") {
      let timeFromStr = input.match(/\d+[sS]{1}/g);
      if (timeFromStr)
        return parseInt(timeFromStr[0].toLocaleLowerCase().replace("s", "")) * 1000;
    }
    return false;
  }
  function scrollUnitCheck(input) {
    if (typeof input === "number" && input >= 0) return input;
    if (typeof input === "string") {
      let timeFromStr = input.match(/[0-9]+%*/g);
      if (timeFromStr) return parseInt(timeFromStr[0].toLocaleLowerCase().replace("%", ""));
    }
    return false;
  }
  // ======== Event Handlers ========
  // Escape key pressed will close the pop-up
  function escHandle(e) {
    if (e.key === "Escape") {
      _this.closePopup();
    }
  }
  // Make space and enter work as click
  function keyboardHandle(e) {
    if (e.key === " " || e.key === "Enter" || e.key === "Spacebar") {
      $(e.target).click();
    }
  }

  //===============================
  //========= Param Checks ========
  //===============================
  if (!obj.hasOwnProperty("name") || !obj.name) throw Error("Name your pop-up");
  // If this is not an object
  if (!(typeof obj === "object" && obj !== null && !Array.isArray(obj)))
    throw Error("No settings set");
  // Check if there is a selector supplied and it that element exists
  if (
    (obj.content === undefined && !obj.hasOwnProperty("content")) ||
    (!(obj.content instanceof jQuery) &&
      (!obj.content || obj.content.nodeType === undefined || obj.content.nodeType !== 1)) ||
    (obj.content instanceof jQuery && obj.content[0] === undefined)
  )
    throw Error(
      "No pop up content was found stopping. Check your selector or if the element exists."
    );

  // if there are no settings create empty settings
  const settings = obj.hasOwnProperty("settings") ? obj.settings : {};
  // if a setting is missing default value will be assigned
  if (Object.keys(settings).length === 0) console.log("No settings given using defaults");
  if (!settings.hasOwnProperty("timeout")) settings.timeout = 0;
  if (!settings.hasOwnProperty("scrollPercent")) settings.scrollPercent = 0;
  if (!settings.hasOwnProperty("fullScreen")) settings.fullScreen = true;
  if (!settings.hasOwnProperty("session")) settings.session = true;
  if (!settings.hasOwnProperty("speed")) settings.speed = 200;
  if (!settings.hasOwnProperty("closeBtnColor")) settings.closeBtnColor = "000000";
  if (!settings.hasOwnProperty("callToAction")) settings.callToAction = false;
  if (!settings.hasOwnProperty("defaultCSS")) settings.defaultCSS = true;

  // If there are settings then make type checks
  if (typeof settings.fullScreen !== "boolean") {
    console.log("Settings.[fullScreen] should be true/false, using default, true");
    settings.fullScreen = true;
  }
  if (typeof settings.session !== "boolean") {
    console.log("Settings.[session] should be true/false, using default, true");
    settings.session = true;
  }
  if (typeof settings.defaultCSS !== "boolean") {
    console.log("Settings param [defaultCSS] should be true/false, using default, true");
    settings.defaultCSS = true;
  }
  if (
    typeof settings.callToAction !== "string" ||
    settings.callToAction !== false ||
    hasWhitespace(settings.callToAction)
  ) {
    console.log(
      "Settings param [callToAction] should be a string with no spaces or false, using default false"
    );
    settings.callToAction = false;
  }
  if (timeUnitCheck(settings.timeout) === false) {
    throw Error("Param [timeout] should be a number or string '3s'");
  }
  if (scrollUnitCheck(settings.scrollPercent) === false) {
    throw Error("Param [scrollPercent] should be a number or string like '90%'");
  }
  // ========================================
  // ======== Basic Checks completed ========
  // ========================================

  // Setup Variables
  settings.timeout = timeUnitCheck(settings.timeout);
  settings.scrollPercent = scrollUnitCheck(settings.scrollPercent);
  const storeObject = settings.session ? sessionStorage : localStorage;
  const _this = this; // Bind 'this' to a variable
  let mainPopupContainer; // The popup itself
  const pName = obj.name; // pop up name
  let pModalOverlay = ""; // modal overlay
  // Get the element from the content selector and convert from jQuery to vanilla js
  let cElem = obj.content instanceof jQuery ? obj.content[0] : obj.content;

  // ======== Setup Object's settings ========
  this.status = {
    id: pName,
    get dismissed() {
      return browserStorage();
    },
    set dismissed(input) {
      browserStorage(input);
    },
    timerRunning: false,
  };
  let scrolled = false;
  let timeExpired = false;

  function browserStorage(input) {
    // Get storage type session/local
    let browserData = getJSON(); // get data returns array
    let dummyData = { id: pName, dismissed: false, timerRunning: false };

    // no browser data set dummy one
    if (!browserData) {
      setJSON([dummyData]);
      // no pop up data then means it was never dismissed
      return false;
    }
    const entryIndex = browserData.findIndex((entry) => entry.id === pName);
    const simpleRead = typeof input !== "boolean" && !input ? true : false;
    // nothing found and is simple read then push this
    if (entryIndex == -1 && simpleRead) {
      browserData.push(dummyData);
      setJSON(browserData);
      return false;
    }
    // If something was found then
    if (entryIndex >= 0) {
      if (!simpleRead) {
        browserData[entryIndex].dismissed = input;
        setJSON(browserData);
      }
      if (simpleRead) return browserData[entryIndex].dismissed;
    }
  }

  function getJSON() {
    // Get storage type session/local
    let browserData = storeObject.getItem(dataSinkId); // get item
    if (!browserData) {
      // No browser found in data
      return false;
    } else {
      // return data parsed
      parsedData = JSON.parse(browserData);
      return parsedData;
    }
  }
  function setJSON(input) {
    if (!input || (typeof input !== "object" && !Array.isArray(obj))) {
      throw Error("setJSON input was not array or empty.");
    }
    const stringifiedData = JSON.stringify(input);
    // Set the item
    storeObject.setItem(dataSinkId, stringifiedData);
  }

  // ===========================================================
  // ============== Create pop up from the content =============
  // ===========================================================

  // Check if this pop up or if there is entry then stop
  if (this.status.dismissed) {
    console.log("Pop-up: '" + this.status.id + "' already dismissed, will do nothing");
    return;
  }

  // === 1. Clone the content ===
  const cElemCloned = cElem.cloneNode(true);
  // === 2a. Create Close Button ===
  let closeBtn = document.createElement("button"); // btn
  let closeImg = document.createElement("img"); // img
  let closeText = document.createElement("span"); // text
  closeBtn.classList.add("closeBtn");
  closeImg.classList.add("closeBtn-img");
  closeText.classList.add("closeBtn-label");

  closeImg.src = "/img/svg/closecross.svg?a=" + settings.closeBtnColor; // Hex
  closeImg.alt = "Close Icon";
  // Add Aria Labels for accessbility
  closeBtn.setAttribute("aria-label", "Close Popup");
  closeImg.setAttribute("aria-hidden", "true");
  closeText.setAttribute("aria-hidden", "true");
  closeText.innerText = "Close";
  // Close Button is ready.

  // === 2b. Create container for button and content ===
  let pCtr = document.createElement("div");
  pCtr.classList.add(pName + "-popupCtr"); // Add class

  // Add img and text in the button
  closeBtn.appendChild(closeImg);
  closeBtn.appendChild(closeText);
  // Add button
  pCtr.appendChild(closeBtn);
  pCtr.appendChild(cElemCloned); // Add the cloned content
  mainPopupContainer = pCtr; // Set it as main container

  // Create basic CSS for the popup
  let outterWrapCSS = `
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: none;
  `;
  // === 2c. Search for a title and set that for accessibility purposes ===
  const modalFirstTitle =
    cElem.querySelector("h2") || cElem.querySelector("h3") || cElem.querySelector("h4");
  if (modalFirstTitle) {
    modalFirstTitle.id = "modalTitle";
    cElem.setAttribute("aria-labelledby", "modalTitle");
  }
  // The pop-up is in fullscreen run additional functions
  if (settings.fullScreen) {
    // Create CSS rules for overlay CSS
    let overlayCss = `
    width: 100%;
    height: 100%;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    position: fixed;
    background-color: rgba(0,0,0,.6);
    `;
    // Re-write the CSS for a full screen outter wrap
    outterWrapCSS = `
    width: 100%;
    height: 100%;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    padding: 1rem;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    position: fixed;
    display: none;
    z-index: 200;
    `;
    // === 2d. Create overlay and an extra, outter wrap, for the overlay and popup ===
    pModalOverlay = document.createElement("div"); // Create Overlay
    pModalOverlay.classList.add("modal-overlay");
    pModalOverlay.style.cssText = overlayCss; // Add CSS for the overlay

    let pCtrOutterWrap = document.createElement("div"); // Create Outter Wrap
    pCtrOutterWrap.classList.add(pName + "-popupOutterWrap");
    pCtrOutterWrap.appendChild(pModalOverlay); // Add the overlay
    pCtrOutterWrap.appendChild(pCtr); // Add the (cloned) content container
    pCtr.style.position = "relative"; // Position relative to go over the overlay
    // Full screen will override mainPopupContainer
    mainPopupContainer = pCtrOutterWrap;
    // Add aria attributes for a modal
    pCtr.setAttribute("tabindex", "-1");
    pCtr.setAttribute("role", "dialog");
    pCtr.setAttribute("aria-modal", "true");

    // Function to trap focus for fullscreen
    function trapFocus(element) {
      var focusableEls = element.querySelectorAll(
        'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
      );
      var firstFocusableEl = focusableEls[0];
      var lastFocusableEl = focusableEls[focusableEls.length - 1];
      var KEYCODE_TAB_1 = 16;
      var KEYCODE_TAB_2 = 9;

      element.addEventListener("keydown", function (e) {
        var isTabPressed = e.key === "Tab" || e.keyCode === KEYCODE_TAB_1 || KEYCODE_TAB_2;

        if (!isTabPressed) {
          return;
        }
        if (e.shiftKey) {
          /* shift + tab */ if (document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
          }
        } /* tab */ else {
          if (document.activeElement === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
          }
        }
      });
      element.focus();
    }
  }
  // ======= Clean up =======
  // Remove display none
  cElemCloned.style.display = "block";
  // Add the new HTML before the old
  mainPopupContainer.style.cssText = outterWrapCSS;
  // Add generated containers/HTML to the parent of the content element
  cElem.parentNode.insertBefore(mainPopupContainer, cElem);
  // Remove the old element that is from content
  cElem.remove();
  // Set the variable for
  this.element = mainPopupContainer;

  // ========================================
  // ==== Detect if the scroll has passed ===
  // ========================================
  this.waypointDetection = function () {
    if (scrolled || _this.status.dismissed) return;

    let scrolling = false;
    function isScrolling() {
      scrolling = true;
    }
    window.addEventListener("scroll", isScrolling);

    // Set interval to throttle scroll events
    const intervalScript = setInterval(function () {
      if (scrolling) {
        scrolling = false;
        // Run the script
        let scrolledPc = parseInt(
          ((scrollY + window.innerHeight) /
            (document.body.scrollHeight + window.innerHeight)) *
            100
        );
        if (scrolledPc > settings.scrollPercent && !scrolled) {
          console.log("This has been scrolled");
          scrolled = true;
          clearInterval(intervalScript);
          window.removeEventListener("scroll", isScrolling);
          _this.showPopUp();
        }
      }
    }, 500);
  };
  // ========================================
  // =========== Timeout detection ==========
  // ========================================
  this.timeoutExpiredDetection = function () {
    // If the timer is expired then
    if (_this.status.dismissed || timeExpired) return;
    const timeut = setTimeout(function () {
      timeExpired = true; // The timer is expired
      console.log("Timer Expired");
      _this.showPopUp();
    }, settings.timeout);
  };

  // ========================================
  // ============== Show Pop up =============
  // ========================================
  this.showPopUp = function () {
    if (!scrolled || !timeExpired) return false;

    if (settings.fullScreen) {
      $(this.element).fadeIn(settings.speed, function () {
        trapFocus(pCtr);
      });
      // If a call to action will be clicked then the popup will be dismissed
      if (settings.callToAction)
        $("." + settings.callToAction).on("click", this.closePopup.bind(this));
      pModalOverlay.addEventListener("click", this.closePopup.bind(this));
      document.addEventListener("keydown", keyboardHandle);
      document.addEventListener("keydown", escHandle);
    } else $(this.element).slideDown(settings.speed);
    closeBtn.addEventListener("click", this.closePopup.bind(this));
    this.status.dismissed = false;
  };
  // ========================================
  // ============== Hide Pop up =============
  // ========================================
  this.closePopup = function () {
    if (this.status.dismissed) return false;
    if (settings.fullScreen) {
      console.log("removed event listeners");
      pModalOverlay.removeEventListener("click", this.closePopup.bind(this));
      document.removeEventListener("keydown", keyboardHandle);
      document.removeEventListener("keydown", escHandle);
      $(this.element).fadeOut(settings.speed);
    } else $(this.element).slideUp(settings.speed);
    closeBtn.removeEventListener("click", this.closePopup.bind(this));
    this.status.dismissed = true;
  };
  // ========================================
  // ========== Reset Pop up status =========
  // ========================================
  this.reset = function () {
    if (this.status.timerRunning || this.status.scrolling) return "Things are still running";
    this.status.dismissed = false;
    scrolled = false;
    timeExpired = false;
  };
  // Init
  this.initPopUp = function () {
    this.waypointDetection();
    this.timeoutExpiredDetection();
  };
  this.initPopUp();
}
