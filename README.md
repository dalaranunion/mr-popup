### Quick Usage

Create a new object with parameters:

```
var thePopUp = new mrPopUp({
    name: "MyPopup",
    content: $('#mypopup'),
    settings: {
        timeout: 10,
        scrolPercent: 40,
        },
});
```

### Parameters

| Param                  |      Type       | Required | Default | Description                                                                                                              |
| ---------------------- | :-------------: | :------: | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| name                   |     String      |    ✅    |         | The identifier of the pop-up                                                                                             |
| content                |     Element     |    ✅    |         | Javascript or jQuery element                                                                                          |
| settings.timeout       | Number / String |          | 0       | Number in ms or string "1s" to show pop up in X miliseconds                                                                 |
| settings.scrollPercent |     Number      |          | 0       | Show pop up when X percentage of page is scrolled                                                                        |
| settings.fullScreen    |     Boolean     |          | true    | Be a modal true or false a small popup in the page                                                                        |
| settings.session       |     Boolean     |          | true    | Store pop-up status when dismissed to per session true or False per br owser storage                                    |
| settings.speed         | Number / String |          | 200     | Animation speed of the pop-up                                                                                            |
| settings.closeBtnColor |     String      |          | 000000  | Hex value (without #) for the close (X) icon colour                                                                      |
| settings.callToAction  |     String      |          | false   | Class name used for CTA buttons. Clicking these will mark the pop-up as closed since the call to action has been clicked |
| settings.defaultCSS    |     Boolean     |          | true    | Will use default CSS from the pop-up or not                                                                              |

### Managing pop-up

| Function Call | Description                                         |
| ------------- | --------------------------------------------------- |
| reset()       | This will remove stored status                      |
| showPopUp()   | This will show the pop-up and reset its status      |
| closePopup()  | This will close the pop-up and mark it as dismissed |

Example:

```
// Event listener
$(document).on("click", ".another-close-btn", function () {
    // Usewr the object and call function
    thePopUp.closePopup();
    });
```

### Default CSS

By default CSS is used to make the pop-up as a modal

#### Overlay CSS (modal)

```
    width: 100%;
    height: 100%;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    position: fixed;
    background-color: rgba(0,0,0,.6);
```

#### Overlay CSS (fullscreen)

```
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
```
