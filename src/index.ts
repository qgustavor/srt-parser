interface Line {
  id: string
  startTime: string | number
  endTime: string | number
  text: string
}

interface ParserOptions {
  endOfLine?: string
  numericTimestamps?: boolean
}

class Parser {
  endOfLine = '\r\n'
  numericTimestamps = false

  constructor (options?: ParserOptions) {
    if (options == null) return
    this.endOfLine = options.endOfLine ?? '\r\n'
    this.numericTimestamps = options.numericTimestamps ?? false
  }

  timestampToSeconds (srtTimestamp: string): number {
    const [rest, millisecondsString] = srtTimestamp.split(',')
    const milliseconds = parseInt(millisecondsString)
    const [hours, minutes, seconds] = rest.split(':').map(x => parseInt(x))
    const result = milliseconds * 0.001 + seconds + 60 * minutes + 3600 * hours

    // Fix issues with floats: timestamp '00:01:20,460' result is 80.46000000000001
    return Math.round(result * 1000) / 1000
  };

  // Based on https://github.com/gsantiago/subtitle.js/blob/bbf539771705ede2694ec424fc87c68f519bc9ff/src/formatTimestamp.ts
  secondsToTimestamp (timestamp: number): string {
    const date = new Date(0, 0, 0, 0, 0, 0, timestamp)

    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const ms = Math.floor(
      timestamp - (hours * 3600000 + minutes * 60000 + seconds * 1000)
    )
    function padLeft (value: number, length = 2): string {
      return value.toString().padStart(length, '0')
    }

    return `${padLeft(hours)}:${padLeft(minutes)}:${padLeft(seconds)},${padLeft(ms, 3)}`
  };

  correctFormat (time: string): string {
    // Fix the format if the format is wrong
    // 00:00:28.9670 become 00:00:28,967
    // 00:00:28.967  become 00:00:28,967
    // 00:00:28.96   become 00:00:28,960
    // 00:00:28.9    become 00:00:28,900

    // 00:00:28,96   become 00:00:28,960
    // 00:00:28,9    become 00:00:28,900
    // 00:00:28,0    become 00:00:28,000
    // 00:00:28,01   become 00:00:28,010
    // 0:00:10,500   become 00:00:10,500
    const str = time.replace('.', ',')

    // Handle millisecond
    const [front, ms] = str.split(',')
    const millisecond = this.fixedStrDigit(3, ms)

    // Handle hour
    const [frontHour, frontMinute, frontSecond] = front.split(':')
    const hour = this.fixedStrDigit(2, frontHour, false)
    const minute = this.fixedStrDigit(2, frontMinute, false)
    const second = this.fixedStrDigit(2, frontSecond, false)

    return `${hour}:${minute}:${second},${millisecond}`
  }

  /*
    Make sure string is 'digitCount' long
    If str is shorter than digitCount, pad with 0
    If str is longer than digitCount, slice from the beginning
    Examples:

    Input: fixedStrDigit(3, '100')
    Output: 100
    Explain: unchanged, because "100" is 3 digit

    Input: fixedStrDigit(3, '50')
    Output: 500
    Explain: pad end with 0

    Input: fixedStrDigit(3, '50', false)
    Output: 050
    Explain: pad start with 0

    Input: fixedStrDigit(3, '7771')
    Output: 777
    Explain: slice from beginning
  */
  private fixedStrDigit (
    digitCount: number,
    str: string,
    padEnd: boolean = true
  ): string {
    if (str.length === digitCount) {
      return str
    }
    if (str.length > digitCount) {
      return str.slice(0, digitCount)
    }
    if (padEnd) {
      return str.padEnd(digitCount, '0')
    }
    return str.padStart(digitCount, '0')
  }

  private tryComma (data: string): string[] {
    data = data.replace(/\r/g, '')
    const regex =
      /(\d+)\n(\d{1,2}:\d{2}:\d{2},\d{1,3}) --> (\d{1,2}:\d{2}:\d{2},\d{1,3})/g
    const dataArray = data.split(regex)
    dataArray.shift() // remove first '' in array
    return dataArray
  }

  private tryDot (data: string): string[] {
    data = data.replace(/\r/g, '')
    const regex =
      /(\d+)\n(\d{1,2}:\d{2}:\d{2}\.\d{1,3}) --> (\d{1,2}:\d{2}:\d{2}\.\d{1,3})/g
    const dataArray = data.split(regex)
    dataArray.shift() // remove first '' in array
    return dataArray
  }

  fromSrt (data: string): Line[] {
    const originalData = data
    let dataArray = this.tryComma(originalData)
    if (dataArray.length === 0) {
      dataArray = this.tryDot(originalData)
    }

    const items = []
    for (let i = 0; i < dataArray.length; i += 4) {
      let startTime: number | string = this.correctFormat(dataArray[i + 1].trim())
      let endTime: number | string = this.correctFormat(dataArray[i + 2].trim())
      if (this.numericTimestamps) {
        startTime = this.timestampToSeconds(startTime)
        endTime = this.timestampToSeconds(endTime)
      }
      const line: Line = {
        id: dataArray[i].trim(),
        startTime,
        endTime,
        text: dataArray[i + 3].trim()
      }
      items.push(line)
    }

    return items
  }

  toSrt (data: Line[]): string {
    const endOfLine = this.endOfLine
    let res = ''
    for (let i = 0; i < data.length; i++) {
      const s = data[i]
      let startTime = s.startTime
      let endTime = s.endTime
      if (typeof startTime === 'number') {
        startTime = this.secondsToTimestamp(startTime)
      }
      if (typeof endTime === 'number') {
        endTime = this.secondsToTimestamp(endTime)
      }
      res += s.id + endOfLine +
        startTime + ' --> ' + endTime + endOfLine +
        s.text.replace('\n', endOfLine) + endOfLine + endOfLine
    }

    return res
  }
}

export default Parser
export { Line }
