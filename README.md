# use-date-countdown

> Hook to generate dynamic values for days/hours/minutes etc. left to some date.

[![NPM](https://img.shields.io/npm/v/use-date-countdown.svg)](https://www.npmjs.com/package/use-date-countdown) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-date-countdown
```

## Usage

```tsx
import * as React from 'react'

import { useMyHook } from 'use-date-countdown'

const Example = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
```

## License

MIT © [totalolage](https://github.com/totalolage)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
