function changeTab(event, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    document.getElementById(tabName).style.display = "block"
}

var colorPicker = document.getElementById("pickerBoxContainer");

function openColorPicker(event) {
    if (colorPicker.style.display != 'block')
        colorPicker.style.display = 'block'
    else
        colorPicker.style.display = 'none'
}

function handleColorPicker(event) {
    colorPicker.style.display = 'none'
}

function chooseElement(event, facility) {
    
}
