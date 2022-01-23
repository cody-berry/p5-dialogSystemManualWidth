class DialogBox {
    constructor(passages, highlightIndices, msPerPassage, textFrame) {
        // let's assign the passages we have, the highlight indices given in
        // a tuple, and the milliseconds per passage!
        colorMode(HSB, 360, 100, 100, 100)
        this.passages = passages
        this.highlightIndices = highlightIndices
        this.msPerPassage = msPerPassage
        // we can also load the text frame
        this.textFrame = textFrame
        this.textFrame.resize(640, 360)
        // our current passage index
        this.currentIndex = 0
        // our current character index
        this.characterIndex = 0
        // the last advanced millisecond
        this.lastAdvance = millis()
        // a cache to store our character widths.
        this.cache = {}
    }

    // loads the saved box texture with transparency
    renderTextFrame(cam) {
        cam.beginHUD(p5._renderer, width, height)
        image(this.textFrame, 0, 0, width, height)
        cam.endHUD()
    }

    // right now, this function only shows a single line
    renderText(cam) {
        cam.beginHUD(p5._renderer, width, height)
        // our current passage
        let currentPassage = this.passages[this.currentIndex]
        // our margins
        let leftMargin = 140
        let topMargin = 520
        stroke(50, 50, 50)
        // draws a 50-by-50 cross where our text bottom-left is supposed to go.
        // line(leftMargin, topMargin-50, leftMargin, topMargin+50)
        // line(leftMargin-50, topMargin, leftMargin+50, topMargin)
        // our positions
        let x = leftMargin
        let y = topMargin
        let wrap = false
        fill(0, 0, 100)
        for (let i = 0; i < this.characterIndex; i++) {
            let c = currentPassage[i]
            // now we're checking if we should start highlighting or not, so
            // if i is the starting index of one of the tuples...
            for (let highlight of this.highlightIndices[this.currentIndex]) {
                if (i === highlight[0] - 1) {
                    // ...we fill with yellow...
                    fill(63, 60, 75)
                    // console.log("yellow!")
                }
                // ...and if i is the ending index...
                if (i === highlight[1]) {
                    // ...we reset our fill to white.
                    fill(0, 0, 100)
                }
            }

            if (c !== ' ') {
                text(c, x, y)
                x += this.charWidth(c)
            } else {
                x += 7
            }

            // now, we can do word wrap.
            // if our current character is a space...
            if (c === ' ') {
                // ...we should find the rest of the passage...
                let restOfPassage = currentPassage.substring(i+1)
                // ...the next delimiter index...
                let nextDelimiterIndex = restOfPassage.indexOf(' ') + i+1
                // ...our current word...
                let currentWord = currentPassage.substring(i, nextDelimiterIndex)
                // ...the text width of the current word...
                let textWidthCurrentWord = this.wordWidth(currentWord)
                // ...and finally, if x plus the text width of the current
                // word is equal to an x wrap defined below, set wrap to true...
                let x_wrap = width - leftMargin
                if (x + textWidthCurrentWord > x_wrap) {
                    wrap = true
                }
            }
            // ...and, if our wrap is true, we reset x, increment y, and
            // reset wrap to false.
            if (wrap) {
                x = leftMargin
                y += textAscent() + textDescent() + 6
                wrap = false
            }
        }
        cam.endHUD()
    }

    // update our status
    update() {
        // if our characters aren't already done skipping, we should
        // increment our character index
        let currentPassage = this.passages[this.currentIndex]
        if (this.characterIndex < currentPassage.length) {
            // the reciprocal of this increase number is actually the number
            // of frames per increase. In this case, it's 5/4.
            this.characterIndex += 4/5
        }
        // because we don't want to go a fraction over
        // currentPassage.length, we have to do a non-separate check
        if (this.characterIndex > currentPassage.length) {
            this.characterIndex = currentPassage.length
        }
        text(this.lastAdvance, 0, height)
        // if the milliseconds passed since the last advance is greater, we
        // advance the current index
        if (millis() - this.lastAdvance > this.msPerPassage[this.currentIndex]) {
            this.currentIndex++
            // now this is deprecated, since each value in msPerPassage is
            // the time from the start
            // this.lastAdvance = millis()
            this.characterIndex = 0
        }
    }

    /*  return the width in pixels of char using the pixels array
 */
    charWidth(char) {
        if (this.cache[char]) {
            return this.cache[char]
        } else {
            let FONT_SIZE = 14
            /**
             * create a graphics buffer to display a character. then determine its
             * width by iterating through every pixel. Noting that 'm' in size 18
             * font is only 14 pixels, perhaps setting the buffer to a max width of
             * FONT_SIZE is sufficient. The height needs to be a bit higher to
             * account for textDescent, textAscent. x1.5 is inexact, but should be
             * plenty.
             * @type {p5.Graphics}
             */
            let g = createGraphics(FONT_SIZE, FONT_SIZE * 1.5)
            g.colorMode(HSB, 360, 100, 100, 100)
            g.textFont(font, FONT_SIZE)
            g.background(0, 0, 0)
            g.fill(0, 0, 100)
            g.text(char, 0, 0)
            let maxX = 0; // our maximum x
            let d = g.pixelDensity() // our pixel density

            g.text(char, 0, textAscent())

            g.loadPixels()

            for (let x = 0; x < g.width; x++) {
                for (let y = 0; y < g.height; y++) {
                    let i = 4 * d * (y * g.width + x)
                    let redNotZero = (g.pixels[i] !== 0)
                    let greenNotZero = (g.pixels[i + 1] !== 0)
                    let blueNotZero = (g.pixels[i + 2] !== 0)
                    /**
                     * What does it mean for a pixel to be non-black?
                     * It means that one of the red, blue, or green not zeros have
                     * to be true.
                     */
                    let notBlack = redNotZero || greenNotZero || blueNotZero
                    if (notBlack) {
                        maxX = x
                        // stroke(100, 100, 100)
                        // point(x, y)
                    }
                }
            }
            this.cache[char] = maxX
            return maxX
        }
    }

    /**
     * use charWidth to find the width of more than one character
     */
    wordWidth(word) {
        let sum = 0
        let SPACE_WIDTH = 7
        let LETTER_SPACING = 1.25

        // add the sum of "olive" the char widths plus the word spacing. for
        // spaces, use spaceWidth.

        for (let c of word) {
            if (c === " ") {
                // we don't want to space the letters into a space.
                sum += SPACE_WIDTH - LETTER_SPACING
            } else {
                // We need to make room for the character and some spacing,
                // determined by L
                sum += this.charWidth(c) + LETTER_SPACING
            }
        }
        if (word[-1] !== " ") {
            sum -= LETTER_SPACING
        }

        return sum
    }
}