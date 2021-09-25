'use strict'

/* global browser, Promise */

const cmds = require('wdio-screen-commands')

/* eslint-disable jsdoc/valid-types */
/** @type WebdriverIO.HookFunctionExtension */
const config = {
  before: async () => {
    // Add browser commands:
    browser.addCommand('saveScreenshotByName', cmds.saveScreenshotByName)
    browser.addCommand('saveAndDiffScreenshot', cmds.saveAndDiffScreenshot)
    // Add element commands:
    browser.addCommand('saveScreenshotByName', cmds.saveScreenshotByName, true)
    browser.addCommand(
      'saveAndDiffScreenshot',
      cmds.saveAndDiffScreenshot,
      true
    )
    if (browser.config.appium)
      await browser.updateSettings(browser.config.appium)
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
