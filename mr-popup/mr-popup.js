function mrPopUp(
  popupNameInput,
  timeOutInput,
  scrollPercentInput,
  animationSpeed
) {
  // Check if input is right unit: number (miliseconds) or string "12s" (seconds)
  function timeUnitCheck(input) {
    if (typeof input === "number") return input;
    if (typeof input === "string") {
      let timeFromStr = input.match(/\d+[sS]{1}/g);
      if (timeFromStr)
        return timeFromStr[0].toLocaleLowerCase().replace("s", "") * 1000;
    }
    console.log(
      'Invalid animation time unit, it should be number or string: "5s" or 5000. Default animation values will be used'
    );
    return false;
  }
  //=== Setup the Objects ===
  // Store the settings from params
  this.settings = {
    localStorageLabel: "mrPopUp",
    get animationSpeed() {
      const timeUnit = timeUnitCheck(animationSpeed);
      // Time fallback
      return timeUnit || 400;
    },
    popupName: popupNameInput,
    popUp: "",
    // Timeout in Seconds
    get timeOut() {
      const timeUnit = timeUnitCheck(timeOutInput);
      // Timeout fallback
      return timeUnit || 30000;
    },
    // After % scroll
    get scrollPercent() {
      if (typeof input === "number") return scrollPercentInput;
      console.log(
        "Invalid scroll unit, it should be number, for 50%  . Default animation values will be used"
      );
      return 60;
    },
    get method() {
      if (timeOutInput && scrollPercentInput) return "both";
      if (timeOutInput) return "timeOnly";
      if (scrollPercentInput) return "scrollOnly";
    },
  };
  this.status = {
    scrolled: false,
    timeExpired: false,
    dismissed: false,
    browserPopUps: [],
    scrolling: false,
    timerRunning: false,
  };

  //Bind 'this' to a variable
  const _this = this;
  // Detect if the scroll has passed
  this.waypointDetection = function () {
    if (_this.status.scrolling === true) return false;
    if (_this.status.scrolled === true) return true;

    _this.status.scrolling = true;
    let scrolling = false;
    function isScrolling() {
      scrolling = true;
    }
    window.addEventListener("scroll", isScrolling);

    // Set interval to throttle scroll events
    const intervalScript = setInterval(() => {
      if (scrolling) {
        scrolling = false;
        // Run the script
        scrolledPc = parseInt(
          ((scrollY + window.innerHeight) / (scrollMaxY + window.innerHeight)) *
            100
        );
        if (
          scrolledPc > _this.settings.scrollPercent &&
          !_this.status.scrolled
        ) {
          console.log("This has been scrolled");
          _this.status.scrolled = true;
          _this.status.scrolling = false;
          _this.method();
          clearInterval(intervalScript);
          window.removeEventListener("scroll", isScrolling);
        }
      }
    }, 500);
  };
  // time out timer
  this.timeoutExpiredDetection = function () {
    // If the timer is Running return
    if (_this.status.timerRunning === true) return false;
    // If the timer is expired then
    if (_this.status.timeExpired === true) return true;
    // The timer is running
    _this.status.timerRunning = true;
    const timeOut = setTimeout(function () {
      _this.status.timeExpired = true; // The timer is expired
      _this.status.timerRunning = false; // The timer has stopped running
      console.log("Timer Expired");
      _this.method(); // Check the method
    }, _this.settings.timeOut);
  };
  this.method = function () {
    switch (this.settings.method) {
      case "both":
        this.waypointDetection();
        this.timeoutExpiredDetection();

        if (this.timeoutExpiredDetection() && this.waypointDetection())
          this.showPopUp();
        break;
      case "timeOnly":
        this.timeoutExpiredDetection();
        if (this.timeoutExpiredDetection()) this.showPopUp();
        break;
      case "scrollOnly":
        this.waypointDetection();
        if (this.waypointDetection()) this.showPopUp();
        break;
      default:
        return "Wrong Method, you can select both, timeOnly and scrollOnly";
    }
    this.updateLocalStorage(true);
  };
  // returns: True popup dismissed, False hasn't been dismissed OR first time visitor
  // Takes input: True will update the local storage based on the browser, false updates from localstorage
  this.updateLocalStorage = function (cmd) {
    // get local storage, parse and store it in the object
    this.status.browserPopUps = JSON.parse(
      localStorage.getItem(localStorageLabel)
    );
    // Set variable outside of the try block
    let existingEntryIndex;
    // Error check if the JSON return bad data; anything that is not an array
    // then the code bellow will error
    try {
      existingEntryIndex = this.status.browserPopUps.findIndex(function (
        entry
      ) {
        return entry.popupName === _this.settings.popupName;
      });
      // console.log(_this.status.browserPopUps[existingEntryIndex]);
    } catch (error) {
      // Set to -1 = not found
      existingEntryIndex = -1;
      // Since it is not an array then re-set the object to an empty array
      this.status.browserPopUps = [];
      //console.log(this, error, existingEntryIndex, this.status.browserPopUps);
    }
    // If there is an entry update popup object with status from storage
    if (existingEntryIndex >= 0) {
      if (cmd === false)
        this.status.dismissed = this.status.browserPopUps[
          existingEntryIndex
        ].dismissed;
      if (cmd === true)
        this.status.browserPopUps[
          existingEntryIndex
        ].dismissed = this.status.dismissed;
    } else {
      this.status.browserPopUps.push({
        popupName: this.settings.popupName,
        dismissed: this.status.dismissed,
      });
    }
    // Update the local storage based on popup object
    localStorage.setItem(
      localStorageLabel,
      JSON.stringify(this.status.browserPopUps)
    );
    // Return the current pop up status
    return this.status.dismissed;
  };
  // This will show the popup
  this.showPopUp = function () {
    $(this.settings.popUp).slideDown(animationSpeed);
    this.status.dismissed = false;
    this.updateLocalStorage(true);
  };
  // This will hide the popup
  this.closePopup = function () {
    $(this.settings.popUp).slideUp(animationSpeed);
    this.status.dismissed = true;
    this.updateLocalStorage(true);
  };
  // Resets all the statuses and the local storage
  this.reset = function () {
    if (this.status.timerRunning || this.status.scrolling)
      return "Things are still running";
    this.status.dismissed = false;
    this.status.timeExpired = false;
    this.status.scrolled = false;
    this.updateLocalStorage(true);
  };
  // Init
  this.initPopUp = function () {
    // If the popupname is not a string
    if (typeof this.settings.popupName !== "string")
      return new Error("The name of the Pop up needs a CSS Selector");
    this.settings.popUp = document.querySelector(this.settings.popupName);
    if (!this.settings.popUp)
      return new Error(
        "There is no element within HTML to match selector or selector is invalid"
      );
    // If a pop-up has been dismissed then stop
    if (this.updateLocalStorage(false))
      return (
        "Pop-up: '" +
        this.settings.popupName +
        "' already dismissed, will do nothing"
      );
    //Else carry on
    this.method();
  };
  this.initPopUp();
}
