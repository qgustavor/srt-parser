## @qgustavor/srt-parser

Just other SRT parser for JavaScript: it reads an `.srt` file into an array! Also, a fork of srt-parser-2 with so many changes that it will never be merged!

## Usage

If you are using Node or a bundler you need to install using the following command:

```bash
npm install @qgustavor/srt-parser
```

If you are not using npm but yarn, or pnpm or something else you probably know how to convert the npm command to the one your tool uses.

```javascript
import SrtParser from '@qgustavor/srt-parser'

const srt = `
1
00:00:11,544 --> 00:00:12,682
Hello
`

const parser = new SrtParser()
const parsed = parser.fromSrt(srt)
console.log(parsed)
```

If you are using Deno just add the `npm:` prefix to the import.

It will return something like this:

```json5
[{
  id: '1',
  startTime: '00:00:11,544',
  endTime: '00:00:12,682',
  text: 'Hello'
}]
```

To turn array back to SRT string, do the following:

```javascript
const stringified = parser.toSrt(parsed)
console.log(stringified)
```

If you want timestamps as numbers (in seconds) instead of strings use the following:

```javascript
const parser = new SrtParser({
  numericTimestamps: true
})
```

### Environment support

Since it only process text, it should work in most JavaScript environments.

## CLI

```
npx @qgustavor/srt-parser -i input.srt -o output.json --minify
```

Options:

| Option         | Required | Default     |
| -------------- | -------- | ----------- |
| --input or -i  | Yes      |             |
| --output or -o | No       | output.json |
| --minify       | No       | false       |

## License

MIT

## Why?

Besides the issues on other SRT parsers [listed by srt-parser-2](https://github.com/1c7/srt-parser-2#why), srt-parser-2 also have some issues:

- The developer does not have time to work on the project.
- The way it handles numeric timestamps is not clear, leads to foot guns and it's hard to fix without a major breaking change.
- I don't like the typos in the README, nor the mixed snake and camel cases, nor semicolons.
- I don't like the docs folder (looks like it came from a template, some of it was in Chinese), neither the examples folder (they differ from the README).
- I don't like the use of `var` neither the lack of a code style linter.
- To be fair I don't like the use of constructors since the parser is not stateful, but rewritting it is hard, so fixing it will be left as a task to the next fork.
