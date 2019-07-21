'use strict'

exports.config = Object.assign({}, require('./chrome').config, {
  // Docker for Mac host address:
  hostname: 'host.docker.internal',
  capabilities: [
    {
      // safaridriver supports no parallel sessions:
      maxInstances: 1,
      browserName: 'safari'
    }
  ],
  videos: {
    enabled: true,
    inputFormat: 'mjpeg',
    startDelay: 500,
    stopDelay: 500
  },
  assetsDir: process.env.MACOS_ASSETS_DIR
})
