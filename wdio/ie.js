'use strict'

/* eslint-disable jsdoc/valid-types */
/** @type WebdriverIO.Config */
const config = {
  hostname: process.env.WINDOWS_HOST || 'host.docker.internal',
  port: 4445,
  capabilities: [
    {
      // IEDriverServer supports no parallel sessions:
      maxInstances: 1,
      browserName: 'internet explorer'
    }
  ],
  videos: {
    enabled: true,
    inputFormat: 'mjpeg',
    startDelay: 500,
    stopDelay: 500
  },
  assetsDir: process.env.WINDOWS_ASSETS_DIR
}

exports.config = Object.assign({}, require('./chrome').config, config)
