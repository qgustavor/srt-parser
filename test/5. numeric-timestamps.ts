// Test .srt file parsing with numeric timestamps
import chai from 'chai'
import fs from 'fs'
import Parser from '../src/index'

const srt = fs.readFileSync('./test-file/Welcome-648062.en.srt', {
  encoding: 'utf-8'
})

describe('Read 00:00:00.05 --> 00:00:02.00', function () {
  chai.should()
  const parser = new Parser({
    numericTimestamps: true
  })
  const result = parser.fromSrt(srt)

  it('into 00:00:00,050 and 00:00:02,000', function () {
    chai.expect(result[0].startTime).to.equal(0.05)
    chai.expect(result[0].endTime).to.equal(2)
  })
})
