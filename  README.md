This is a really quick description of that what mr-popup does

Create a new class with parameters:

```
var thePopUp = new mrPopUp({
name: "MyPopup",
content: ".pop-up-width",
settings: {
timeout: 10,
scrolPercent: 40,
}
});
```

## Parameters

| Param                  |      Type       | required | Default | Description                                                                    |
| ---------------------- | :-------------: | :------: | ------- | ------------------------------------------------------------------------------ |
| Name                   |     String      |   [x]    |         | The identifier of the pop-up                                                   |
| content                |     Element     |   [x]    |         | An javascript or jQuery element                                                |
| settings.timeout       | Number / String |    []    | 0       | Number in ms or string "1s" Show pop up in X miliseconds                       |
| settings.scrollPercent |     Number      |    []    | 0       | Show pop up when X percentage of page is scrolled                              |
| settings.fullScreen    |     Boolean     |    []    | true    | Be a modal true / false a small popup in the page                              |
| settings.session       |     Boolean     |    []    | true    | Remember if the pop-up was dismissed true: per session or False: per browser   |
| settings.speed         | Number / String |    []    | 200     | 1s, Speed of the show/hide animation speed                                     |
| settings.closeBtnColor |     String      |    []    | 000000  | The close X icon colour                                                        |
| settings.callToAction  |     String      |    []    | false   | Class name used for CTA buttons, clicking these will mark the pop-up as closed |
| settings.defaultCSS    |     boolean     |    []    | true    | Will use default CSS from the pop-up or not                                    |

You can also send execute commands by using the object:
$(document).on("click", ".pop-up-close-btn", function () {
thePopUp.closePopup();
});
