#!/usr/bin/env node

'use strict';

var path = require('path');
var packageJSON = require(path.join(__dirname, 'package.json'));
var bowerFile = path.join(__dirname, 'bower.json');
var bowerJSON = require('bower-json').parse(
  require(bowerFile),
  {normalize: true}
);
bowerJSON.version = packageJSON.version;
require('fs').writeFileSync(
  bowerFile,
  JSON.stringify(bowerJSON, null, 2) + '\n'
);
