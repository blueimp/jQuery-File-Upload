'use strict'

/* eslint-disable jsdoc/valid-types */
/** @type WebdriverIO.Config */
const config = {
  hostname: process.env.WINDOWS_HOST || 'host.docker.internal',
  capabilities: [
    {
      // Set maxInstances to 1 if screen recordings are enabled:
      // maxInstances: 1,
      browserName: 'MicrosoftEdge'
    }
  ],
  videos: {
    enabled: false,
    inputFormat: 'mjpeg',
    startDelay: 500,
    stopDelay: 500
  },
  assetsDir: process.env.WINDOWS_ASSETS_DIR || process.env.MACOS_ASSETS_DIR
}

exports.config = Object.assign({}, require('./chrome').config, config)
