'use strict'

/* global browser */

const cmds = require('wdio-screen-commands')

module.exports = {
  before: () => {
    global.should = require('chai').should()
    browser.addCommand('saveScreenshotByName', cmds.saveScreenshotByName)
    browser.addCommand('saveAndDiffScreenshot', cmds.saveAndDiffScreenshot)
    if (browser.config.maximizeWindow) browser.maximizeWindow()
  },
  beforeTest: test => {
    cmds.startScreenRecording(test)
  },
  afterTest: async test => {
    await cmds.stopScreenRecording(test)
    cmds.saveScreenshotByTest(test)
  }
}
