'use strict'

/* global browser, Promise */

const cmds = require('wdio-screen-commands')

/* eslint-disable jsdoc/valid-types */
/** @type WebdriverIO.HookFunctions */
const config = {
  before: async () => {
    browser.addCommand('saveScreenshotByName', cmds.saveScreenshotByName)
    browser.addCommand('saveAndDiffScreenshot', cmds.saveAndDiffScreenshot)
    if (browser.config.maximizeWindow) await browser.maximizeWindow()
  },
  beforeTest: async test => {
    await cmds.startScreenRecording(test)
  },
  afterTest: async (test, context, result) => {
    await Promise.all([
      cmds.stopScreenRecording(test, result),
      cmds.saveScreenshotByTest(test, result)
    ])
  }
}

module.exports = config
