/*

@author Cody
@date 2021-12-6

version comments
    ...🌟 text list, highlight list, milliseconds per passage
    .🌟   display frame
    ..🌟  WEBGL and display it in the same place but with beginHUD() and
     endHUD()
    ...🌟 blender axis
    .🌟   p5.easyCam()
    .🌟   display a single line inside the text frame
    .🌟   word wrap
    .🌟   advancing characters
    .🌟   advancing passages using some time delay system
    .🌟   highlighting
    **    SQUIRREL!!!
*/

let font
let passages // our json file input
let dialogBox // our dialog box
// let's have our hue and default saturation


const red_hue = 0
const green_hue = 85
const blue_hue = 225
const sat = 90
const brightness_light = 60
const brightness_dark = 30
// and our endpoints
const endpoints = 10000

function preload() {
    font = loadFont('data/giga.ttf')
    passages = loadJSON("passages.json")

}

/* populate an array of passage text */
let textList = []
/* grab other information: ms spent on each passage, highlights */
let highlightList = [] // a list of tuples specifying highlights and indexes
let msPerPassage = [] // how long to wait before advancing a passage
let textFrame // our text frame
let cam // our camera

function setup() {
    createCanvas(1280, 720, WEBGL)
    cam = new Dw.EasyCam(this._renderer, {distance: 240});
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)
    for (let p in passages) {
        textList.push(passages[p]["text"])
        // console.log(p.text)
        // console.log(p)
        let list = []
        // we can access the highlight indices for each passage
        for (let highlight of passages[p]["highlightIndices"]) {
            // for each of them, our list should extend by the list given by
            // the highlights
            list.push([highlight["start"], highlight["end"]])
        }
        highlightList.push(list)
        msPerPassage.push(passages[p]["ms"])
        // console.log(msPerPassage)
    }

    console.log(highlightList)
    // console.log(passages.length)
    // console.log(textList)
    textFrame = loadImage("data/textFrame.png")
    // textFrame.resize(640, 360)
    // console.log(textFrame)
    dialogBox = new DialogBox(textList, highlightList, msPerPassage, textFrame)
    // console.log(textFrame)
}

function draw() {
    background(234, 34, 24)
    drawBlenderAxis()
    dialogBox.renderTextFrame(cam)
    dialogBox.renderText(cam)
    dialogBox.update()
    // console.log(textFrame)

}
// prevent the context menu from showing up :3 nya~
document.oncontextmenu = function () {
    return false;
}

// draws our blender axis
function drawBlenderAxis() {
    // red, x
    // dark
    stroke(red_hue, sat, brightness_dark)
    line(0, 0, 0, -endpoints, 0, 0)
    // light
    stroke(red_hue, sat, brightness_light)
    line(0, 0, 0, endpoints, 0, 0)
    // green, y
    // dark
    stroke(green_hue, sat, brightness_dark)
    line(0, 0, 0, 0, -endpoints, 0)
    // light
    stroke(green_hue, sat, brightness_light)
    line(0, 0, 0, 0, endpoints, 0)
    // blue, z
    // dark
    stroke(blue_hue, sat, brightness_dark)
    line(0, 0, 0, 0, 0, -endpoints)
    // light
    stroke(blue_hue, sat, brightness_light)
    line(0, 0, 0, 0, 0, endpoints)
}
