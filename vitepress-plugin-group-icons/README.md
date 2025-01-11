# @ryanjoy/@ryanjoy/vitepress-plugin-group-icons

## Usage

### Install

```sh [npm]
npm install @ryanjoy/vitepress-plugin-group-icons
```

```sh [yarn]
yarn add @ryanjoy/vitepress-plugin-group-icons
```

```sh [pnpm]
pnpm add @ryanjoy/vitepress-plugin-group-icons
```

```sh [bun]
bun add @ryanjoy/vitepress-plugin-group-icons
```

### Configuration

```ts [config.ts]
// .vitepress/config.ts
import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from '@ryanjoy/vitepress-plugin-group-icons'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ],
  }
})
```

```ts [index.ts]
// .vitepress/theme/index.ts
import Theme from 'vitepress/theme'
import 'virtual:group-icons.css'

export default Theme
```

