#!/usr/bin/env node
'use strict'

import { readFile, writeFile } from 'fs/promises'
import { hideBin } from 'yargs/helpers'
import path from 'path'
import SrtParser from '../dist/index.js'
import yargs from 'yargs/yargs'

const argv = yargs(hideBin(process.argv)).argv

const inputFilename = argv.i || argv.input
const outputFilename = path.resolve(argv.o || argv.output || 'output.json')
const parser = new SrtParser()
const minify = !!argv.minify

if (!inputFilename) {
  throw new Error(
    'Input filename is required. Please use the -i or --input flag'
  )
}

let fileContents
try {
  fileContents = await readFile(path.resolve(inputFilename))
} catch (err) {
  console.error('Error reading from input file')
  console.error(err)
  process.exit(1)
}

const result = parser.fromSrt(fileContents.toString())
try {
  await writeFile(
    outputFilename,
    Buffer.from(JSON.stringify(result, null, minify ? null : 2)),
    { flag: 'w' }
  )
  console.log('Successfully parsed and wrote to ' + outputFilename)
} catch (err) {
  console.error('There was a problem writing to file')
  console.error(err)
  process.exit(1)
}
