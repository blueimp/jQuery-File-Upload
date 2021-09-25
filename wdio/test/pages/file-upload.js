'use strict'

/* global browser, $, $$ */
/* eslint-disable class-methods-use-this */

class FileUpload {
  get fileinput() {
    return $('.fileinput-button input')
  }
  get start() {
    return $('.fileupload-buttonbar .start')
  }
  get toggle() {
    return $('.fileupload-buttonbar .toggle')
  }
  get remove() {
    return $('.fileupload-buttonbar .delete')
  }
  get processing() {
    return $$('.files .processing')
  }
  get uploads() {
    return $$('.files .template-upload')
  }
  get downloads() {
    return $$('.files .template-download')
  }
  get checked() {
    return $$('.files .toggle:checked')
  }
  /**
   * Opens the file upload form.
   *
   * @param {number} [timeout] Wait timeout
   */
  async open(timeout) {
    await browser.url('/')
    await this.fileinput.waitForExist({ timeout })
  }
  /**
   * Uploads files.
   *
   * @param {Array<string>} files Files to upload
   * @param {number} [timeout] Wait timeout
   */
  async upload(files, timeout) {
    await this.fileinput.addValue(files.join('\n'))
    await browser.waitUntil(async () => !(await this.processing.length), {
      timeout
    })
    await this.start.click()
    await browser.waitUntil(async () => !!(await this.downloads.length), {
      timeout
    })
    await browser.waitUntil(async () => !(await this.uploads.length), {
      timeout
    })
  }
  /**
   * Deletes uploaded files.
   *
   * @param {number} [timeout] Wait timeout
   */
  async delete(timeout) {
    await this.toggle.click()
    await browser.waitUntil(
      async () => (await this.downloads.length) === (await this.checked.length),
      {
        timeout
      }
    )
    await this.remove.click()
    await browser.waitUntil(async () => !(await this.downloads.length), {
      timeout
    })
  }
}

module.exports = new FileUpload()
