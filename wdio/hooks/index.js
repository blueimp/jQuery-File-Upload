'use strict'

/* global browser, Promise */

const cmds = require('wdio-screen-commands')

/* eslint-disable jsdoc/valid-types */
/** @type WebdriverIO.Config */
const config = {
  before: async () => {
    global.Should = require('chai').should()
    browser.addCommand('saveScreenshotByName', cmds.saveScreenshotByName)
    browser.addCommand('saveAndDiffScreenshot', cmds.saveAndDiffScreenshot)
    if (browser.config.maximizeWindow) await browser.maximizeWindow()
  },
  beforeTest: async test => {
    await cmds.startScreenRecording(test)
  },
  afterTest: async test => {
    await Promise.all([
      cmds.stopScreenRecording(test),
      cmds.saveScreenshotByTest(test)
    ])
  }
}

module.exports = config
