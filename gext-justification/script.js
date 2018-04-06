$(function() {
  // Axis config
  const AXIS_MIN = 0
  const AXIS_MAX = 437

  // Get a string containing a zero-width joiner
  const element = document.createElement('div')
  element.innerHTML = '&zwj;'
  const ZWJ = element.textContent
  element.innerHTML = '&zwnj;'
  const ZWNJ = element.textContent

  // Copy glyphs around extensible glyphs to ensure rendering of contextual alternates
  $('.gext').each((_, g) => {
    // Only copy stuff if there is a zero-width joiner
    const chars = [...g.textContent]
    const prev = g.previousSibling
    const prevChars = [...prev.textContent]
    const startOfWord = []
    if (prevChars[prevChars.length - 1] === ZWJ) {
      for (let i = prevChars.length - 2; i >= 0; --i) {
        if (/\s/.test(prevChars[i])) break;
        startOfWord.unshift(prevChars[i])
      }
    }
    const next = g.nextSibling
    const nextChars = [...next.textContent]
    const endOfWord = []
    if (nextChars[0] === ZWJ) {
      for (let i = 1; i < nextChars.length; ++i) {
        if (/\s/.test(nextChars[i])) break;
        endOfWord.push(nextChars[i])
      }
    }
    // Left side
    if (chars[0] === ZWJ) {
      // Copy inner glyph outside
      const innerLeft = chars[1]
      const span = document.createElement('span')
      span.className = 'gext-outer gext-left'
      // Add a ZWNJ at the frontiers of the gext to prevent the gext's hidden spans
      // from joining with the hidden spans just outside the gext when axis == 0
      span.innerHTML = ZWJ + innerLeft + endOfWord.join('') + ZWNJ
      prev.replaceWith(prev, span)
      // Copy outer glyph inside
      const inSpan = document.createElement('span')
      inSpan.className = 'gext-inner gext-left'
      inSpan.innerHTML = ZWNJ + startOfWord.join('') + ZWJ
      // Make inSpan the first child of g
      g.insertBefore(inSpan, g.firstChild)
      g.leftSpan = inSpan
      g.leftOuterSpan = span
    }
    // Right side
    if (chars[chars.length - 1] === ZWJ) {
      // Copy inner glyph outside
      const innerRight = chars[chars.length - 2]
      const span = document.createElement('span')
      span.className = 'gext-outer gext-right'
      span.innerHTML = ZWNJ + startOfWord.join('') + innerRight + ZWJ
      next.replaceWith(span, next)
      // Copy outer glyph inside
      const inSpan = document.createElement('span')
      inSpan.className = 'gext-inner gext-right'
      inSpan.innerHTML = ZWJ + endOfWord.join('') + ZWNJ
      // Make inSpan the last child of g
      g.appendChild(inSpan)
      g.rightSpan = inSpan
      g.rightOuterSpan = span
    }
  })

  // Add sliders to extensible glyphs
  $('.gext').each((_, g) => {
    let background = $('<span class="background"/>')
    background.appendTo(g)
    let handle = $('<span class="handle"/>')
    handle.mousedown(handleMouseDown)
    handle.appendTo(g)
    let lock = $('<span class="lock"/>')
    lock.click(() => {
      unlock(g)
      justify()
    })
    lock.appendTo(g)
  })

  // // Wire the global slider
  // $('#slider1').on('input', function () {
  //     $(".gext").each((_, g) => {
  //       applyAxisValue(g, $(this).val())
  //     })
  // });

  // Do some stuff after the custom font has been loaded
  document.fonts.ready.then(() => {
    setTimeout(() => {
      // Apply the default axis value to resize inner spans
      $(".gext").each((_, g) => {
        applyAxisValue(g, AXIS_MIN)
      })

      // Init and run the justification
      tokenize()
      measureTokens()
      justify()

      // run the justification whenever the window is resized
      $(window).resize(justify)
    }, 100)
  })

  function tokenize() {
    // Go through #arabic and wrap each word in a .token <span>
    const tokens = []
    let current = []
    const arabic = document.getElementById('arabic')
    arabic.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Assume that this node is a <span> like .gext or .gext-outer etc.
        // Is it part of the current word or of the next word?
        // Look at whether there is a space before it.
        if (current.isSpace) {
          tokens.push(current)
          current = []
        }
        current.push(node)
      } else if (node.nodeType === Node.TEXT_NODE) {
        // Tokenize the text
        [...node.textContent].forEach(char => {
          if (/\s/.test(char)) {
            if (!current.isSpace) {
              if (current.length) {
                tokens.push(current)
                current = []
              }
              current.isSpace = true
            }
          } else {
            if (current.isSpace) {
              tokens.push(current)
              current = []
            }
          }
          current.push(new Text(char))
        })
      }
    })
    // Empty the #arabic and re-fill with token spans
    while (arabic.firstChild) {
      arabic.removeChild(arabic.firstChild)
    }
    tokens.forEach(token => {
      const span = document.createElement('span')
      token.forEach(node => {
        span.appendChild(node)
      })
      if (token.isSpace) {
        span.className = 'token token-space'
        span.isSpace = true
      } else {
        span.className = 'token'
      }
      span.normalize()
      arabic.appendChild(span)
    })
  }

  function measureTokens() {
    // Measure both the min and max size of tokens when they contain a .gext
    // Do that while making sure there are not line breaks in #arabic,
    // as that would make the measurement of spaces around line breaks wrong.
    const arabic = document.getElementById('arabic')
    arabic.style = 'width: 100000px;'
    $('.token').each((_, token) => {
      const $gext = $('.gext', token)
      if ($gext) {
        $gext.each((_, gext) => applyAxisValue(gext, AXIS_MIN))
        token.minWidth = measureWidth(token)
        $gext.each((_, gext) => applyAxisValue(gext, AXIS_MAX))
        token.maxWidth = measureWidth(token)
      } else {
        token.minWidth = measureWidth(token)
        token.maxWidth = token.isSpace ? 10000 : token.minWidth
      }
    })
    arabic.style = ''
  }

  function measureWidth(token) {
    const {left, right} = token.getBoundingClientRect()
    return right - left
  }

  function justify() {
    // First version: do a dumb justification by breaking lines in a greedy manner
    // Then try to justify using available .gexts
    // Then justify using spaces.
    // A later version could use a fancy dynamic programming algorithm.
    const arabic = document.getElementById('arabic')
    // Remove previously added line breaks
    $('br', arabic).remove()
    // Reset all kashidas to the min
    $('.gext:not(.locked)', arabic).each((_, gext) => applyAxisValue(gext, AXIS_MIN))
    // Remove previously added space padding
    $('.token-space', arabic).css({'margin-right': '0px'})

    // Break lines greedily
    const width = getWidth()
    const lines = []
    let currentLine = []
    let currentWidth = 0
    Array.from(arabic.childNodes).forEach(token => {
      if (currentWidth + token.minWidth >= width) {
        token.before(document.createElement('br'))
        // Trim spaces from the end of lines
        while (currentLine[currentLine.length - 1].isSpace) {
          currentLine.pop()
        }
        lines.push(currentLine)
        currentLine = []
        currentWidth = 0
      }
      if (currentLine.length || !token.isSpace) {
        // Don't allow spaces at the start of lines
        $('.gext', token).each((_, gext) => gext.line = currentLine)
        currentLine.push(token)
        currentWidth += token.minWidth
      }
    })

    // Adjust the .gext on each line
    lines.forEach(line => {
      adjustLineGEXTs(line)
      adjustLineSpaces(line)
    })
  }

  function getWidth() {
    const arabic = document.getElementById('arabic')
    return measureWidth(arabic) - 500 // Error margin :)
  }

  function adjustLineGEXTs(line) {
    const width = getWidth()
    // Apply the most suited axis value using our dichotomy function
    const value = dichotomy(AXIS_MIN, AXIS_MAX, width, function(value) {
      let lineWidth = 0
      line.forEach(token => {
        $('.gext:not(.locked)', token).each((_, gext) => applyAxisValue(gext, value))
        lineWidth += measureWidth(token)
      })
      return lineWidth
    })
    line.forEach(token => {
      $('.gext:not(.locked)', token).each((_, gext) => applyAxisValue(gext, value))
    })
  }

  function adjustLineSpaces(line) {
    const width = getWidth()
    let lineWidth = 0
    let spaces = []
    line.forEach(token => {
      lineWidth += measureWidth(token)
      if (token.isSpace) {
        spaces.push(token)
      }
    })
    const diff = width - lineWidth
    const perSpace = diff/spaces.length
    // Distribute the diff over the spaces
    spaces.forEach(token => {
      token.style = `margin-right: ${perSpace}px;`
    })
  }

  function handleMouseDown(event) {
    let handle = event.target
    let gext = handle.parentElement
    let needsJustification = false
    lock(gext)
    handle.initialOffset = getOffset(handle, event)
    // Capture all mouse events during drag
    $(document).mousemove((event) => {
      followMouseUsingExtAxis(handle, event)
      if (gext.line) {
        adjustLineGEXTs(gext.line)
        adjustLineSpaces(gext.line)
        needsJustification = true
      }
    })
    // Also prevent text selection and always show dragging cursor
    $('body').addClass('dragging-handle')
    $(handle).addClass('dragging')
    $(document).mouseup(() => {
      $(document).off('mousemove')
      $('body').removeClass('dragging-handle')
      $(handle).removeClass('dragging')
      if (needsJustification) {
        needsJustification = false
        justify()
      }
    })
  }

  function lock(gext) {
    gext.locked = true
    $(gext).addClass('locked')
  }

  function unlock(gext) {
    gext.locked = false
    $(gext).removeClass('locked')
  }

  function getOffset(handle, event) {
    let rect = handle.getBoundingClientRect()
    return rect.x - event.clientX
  }

  // All gext axis modifications must use this function now,
  // because it keeps the hidden spans at the correct values
  function applyAxisValue(gext, value) {
    let settings = "'GEXT' " + value
    $(gext).css('font-variation-settings', settings)
    // Apply negative margins to inner elements equal to their width
    if (gext.leftSpan) {
      gext.leftSpan.style = `margin-left: -${gext.leftSpan.offsetWidth}px;`
    }
    if (gext.leftOuterSpan) {
      gext.leftOuterSpan.style = `margin-left: -${gext.leftOuterSpan.offsetWidth}px;`
    }
    if (gext.rightSpan) {
      gext.rightSpan.style = `margin-right: -${gext.rightSpan.offsetWidth}px;`
    }
    if (gext.rightOuterSpan) {
      gext.rightOuterSpan.style = `margin-right: -${gext.rightOuterSpan.offsetWidth}px;`
    }
  }

  function followMouseUsingExtAxis(handle, event) {
    /* Find a value along the axis that makes the size of gext such that
     * the current x mouse offset (from event) is the same as the original
     * mouse offset (stored in handle).
     */
    let gext = handle.parentElement
    let initial = handle.initialOffset
    function fun(axisValue) {
      applyAxisValue(gext, axisValue)
      return -getOffset(handle, event)
    }
    return dichotomy(AXIS_MIN, AXIS_MAX, -initial, fun)
  }

  function dichotomy(minInput, maxInput, target, fun) {
    // Find the input so that fun(input) == target

    if (fun(minInput) > target) {
      // We're past the min, do nothing
      return minInput
    }
    if (fun(maxInput) < target) {
      // We're past the max, do nothing
      return maxInput
    }

    // We're somewhere in the middle
    // Use dichotomy to find the best value
    function actualDichotomy(a, b) {
      if ((b - a) < 1) {
        // Sufficient precision
        return a
      }
      let middle = (a + b) / 2
      if (fun(middle) > target) {
        return actualDichotomy(a, middle)
      } else {
        return actualDichotomy(middle, b)
      }
    }
    return actualDichotomy(minInput, maxInput)
  }
});
