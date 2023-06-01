import Parser, { Line } from '../src/index'

import chai from 'chai'
import fs from 'fs'

// Read a correct .srt file
const srt = fs.readFileSync('./test-file/correct.srt', { encoding: 'utf-8' })

describe('Test basic function', function () {
  chai.should()
  let result: Line[]
  const parser = new Parser()

  it('parser.fromSrt() should execute without crashes', function () {
    result = parser.fromSrt(srt)
  })

  it('parser.fromSrt() should return array', function () {
    chai.expect(result).to.be.a('array')
  })

  it('parser.fromSrt() should contain valid subtitle objects', function () {
    for (const s of result) {
      chai.expect(s).to.have.property('id')
      chai.expect(s).to.have.property('startTime')
      chai.expect(s).to.have.property('endTime')
      chai.expect(s).to.have.property('text')
    }
  })

  let originalData: string
  it('parser.toSrt() should execute without crashes', function () {
    originalData = parser.toSrt(result)
  })

  it('parser.toSrt() should convert object back as it was before without changes', function () {
    chai.expect(srt.trim()).to.equal(originalData.trim())
  })
})
