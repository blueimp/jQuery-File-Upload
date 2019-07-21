'use strict'

/* global browser, describe, it */

const FileUpload = require('../pages/file-upload')
const assetsDir = browser.config.assetsDir

describe('File Upload', () => {
  if (!assetsDir) return

  it('uploads files', () => {
    FileUpload.open().upload([
      assetsDir + 'black-80x60.gif',
      assetsDir + 'white-1x2.jpg'
    ])
    browser.saveAndDiffScreenshot('Files uploaded')
  })

  it('deletes files', () => {
    FileUpload.open().delete()
    browser.saveAndDiffScreenshot('Files deleted')
  })
})
