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
   * @returns {FileUpload} FileUpload object
   */
  open(timeout) {
    browser.url('/')
    this.fileinput.waitForExist({ timeout })
    return this
  }
  /**
   * Uploads files.
   *
   * @param {Array<string>} files Files to upload
   * @param {number} [timeout] Wait timeout
   * @returns {FileUpload} FileUpload object
   */
  upload(files, timeout) {
    this.fileinput.addValue(files.join('\n'))
    browser.waitUntil(() => !this.processing.length, { timeout })
    this.start.click()
    browser.waitUntil(() => !!this.downloads.length, { timeout })
    browser.waitUntil(() => !this.uploads.length, { timeout })
    return this
  }
  /**
   * Deletes uploaded files.
   *
   * @param {number} [timeout] Wait timeout
   * @returns {FileUpload} FileUpload object
   */
  delete(timeout) {
    this.toggle.click()
    browser.waitUntil(() => this.downloads.length === this.checked.length, {
      timeout
    })
    this.remove.click()
    browser.waitUntil(() => !this.downloads.length, { timeout })
    return this
  }
}

module.exports = new FileUpload()
