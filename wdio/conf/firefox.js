'use strict'

/* eslint-disable jsdoc/valid-types */
/** @type WebdriverIO.Config */
const config = {
  hostname: 'geckodriver',
  capabilities: [
    {
      // geckodriver supports no parallel sessions:
      maxInstances: 1,
      browserName: 'firefox',
      'moz:firefoxOptions': {
        //args: ['-headless', '--window-size=1440,900']
      }
    }
  ],
  videos: {
    enabled: true,
    resolution: '1440x900',
    startDelay: 500,
    stopDelay: 500
  }
}

exports.config = Object.assign({}, require('./chrome').config, config)
