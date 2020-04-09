'use strict'

/* global browser, describe, it */

const FileUpload = require('../pages/file-upload')
const assetsDir = browser.config.assetsDir

describe('File Upload', () => {
  if (!assetsDir) return

  it('uploads files', () => {
    FileUpload.open().upload([
      assetsDir + 'black+white-60x40.gif',
      assetsDir + 'black+white-3x2.jpg'
    ])
    browser.saveAndDiffScreenshot('Files uploaded')
  })

  it('deletes files', () => {
    FileUpload.open().delete()
    browser.saveAndDiffScreenshot('Files deleted')
  })
})
