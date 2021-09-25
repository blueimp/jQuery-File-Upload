'use strict'

/* global browser, describe, it */

const FileUpload = require('../pages/file-upload')
const assetsDir = browser.config.assetsDir

describe('File Upload', () => {
  if (!assetsDir) return

  it('uploads files', async () => {
    await FileUpload.open()
    await FileUpload.upload([
      assetsDir + 'black+white-60x40.gif',
      assetsDir + 'black+white-3x2.jpg'
    ])
    await browser.saveAndDiffScreenshot('Files uploaded')
  })

  it('deletes files', async () => {
    await FileUpload.open()
    await FileUpload.delete()
    await browser.saveAndDiffScreenshot('Files deleted')
  })
})
