'use strict'

const fs = require('fs');
const path = require('path');
const ncp = require('ncp')
const getFiles = require('recursive-readdir');

const outputDir = './output';
const baseDir = './templates';
const androidPackgePath = 'android/app/src/main/java/com/';



const name = process.argv[2];

if (!name) {
  throw new Error('No name specified');
}

const mappings = {
  'package': 'com.' + name,
  name
}

const renameDotFiles = {
  '_gitignore': '.gitignore',
  '_watchmanconfig': '.watchmanconfig',
}

const renameExampleFiles = [
  'android/app/src/main/java/com/example',
  'ios/example',
  'ios/example.xcodeproj',
  'ios/exampleTests',
  `ios/${name}Tests/exampleTests.m`,
]

const binaries = [
  '**mipmap-.*',
  '**gradlew*',
  '**gradle',
  '**pbxproj',
  '**.xib'
];

function generator(mappings, src) {
  getFiles(src, binaries, function(err, files){
    files.forEach(function(file){
      var contents = fs.readFileSync(file).toString();
      for (let item in mappings) {
        const regEx = new RegExp(`<%= ${item} %>`, 'g');
        contents = contents.replace(regEx, mappings[item]);
      }
      fs.writeFileSync(file, contents);
    })
    renameExampleFiles.forEach(function(fileName){
      const regEx = new RegExp('example', 'g');
      fs.renameSync(path.join(outputDir, fileName), path.join(outputDir, fileName.replace(regEx, name)))
    })
    for (let mapping in renameDotFiles) {
      fs.renameSync(path.join(outputDir, mapping), path.join(outputDir, renameDotFiles[mapping]));
    }
  })
}

ncp('./templates', './output', function(err) {
  generator(mappings, './output')
});
