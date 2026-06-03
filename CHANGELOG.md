# Changelog


## v0.1.2

[compare changes](https://github.com/Lenin0/heatmap-react/compare/v0.1.1...v0.1.2)

### 📖 Documentation

- **CONTRIBUTING:** Document release workflow ([013948b](https://github.com/Lenin0/heatmap-react/commit/013948b))

### 🏡 Chore

- **package-lock:** Update release dependencies ([cf55483](https://github.com/Lenin0/heatmap-react/commit/cf55483))

### 🤖 CI

- **publish:** Add npm publish workflow ([4e95878](https://github.com/Lenin0/heatmap-react/commit/4e95878))

### ❤️ Contributors

- Pedro Lenin <pedrolenin06@gmail.com>

## v0.1.1


### 🚀 Enhancements

- **package:** Configure npm package metadata and build scripts ([7f8d7bf](https://github.com/Lenin0/heatmap-react/commit/7f8d7bf))
- **index:** Export public heatmap library API ([80fa59b](https://github.com/Lenin0/heatmap-react/commit/80fa59b))
- **hooks:** Add useSize for reactive container dimensions and useWheelZoom for scroll zoom support ([20edd73](https://github.com/Lenin0/heatmap-react/commit/20edd73))
- **heatmap.imageMode:** Integrate useSize for reactive markers, add useWheelZoom with scrollZoom toggle, remove unused imgRef ([66b0e9c](https://github.com/Lenin0/heatmap-react/commit/66b0e9c))
- **tooltip:** Add dynamic tooltip field rendering support ([c0575f8](https://github.com/Lenin0/heatmap-react/commit/c0575f8))
- **utils:** Add tooltip value and label resolver helpers ([68be7d7](https://github.com/Lenin0/heatmap-react/commit/68be7d7))
- **map:** Update heatmap map behavior ([f78d68e](https://github.com/Lenin0/heatmap-react/commit/f78d68e))
- **markers:** Update marker rendering behavior ([8e183d8](https://github.com/Lenin0/heatmap-react/commit/8e183d8))

### 🩹 Fixes

- **markers:** Add missing key prop to MarkerItem list render ([8e1a475](https://github.com/Lenin0/heatmap-react/commit/8e1a475))

### 💅 Refactors

- **src:** Estructure heatmap library architecture and components ([bc0fa62](https://github.com/Lenin0/heatmap-react/commit/bc0fa62))
- **types:** Rename sensor types to generic point types, add RenderTooltip alias, fix naming convention to PascalCase ([70e926e](https://github.com/Lenin0/heatmap-react/commit/70e926e))
- **controls:** Replace tailwind classes with inline styles, add labels prop for i18n support ([f037ad0](https://github.com/Lenin0/heatmap-react/commit/f037ad0))
- **heatmap:** Remove mode toggle UI, remove dead style objects, simplify to single routing concern ([bbbe2b3](https://github.com/Lenin0/heatmap-react/commit/bbbe2b3))
- **types:** Improve heatmap point and tooltip type flexibility ([e94a075](https://github.com/Lenin0/heatmap-react/commit/e94a075))
- **heatmapImage:** Update heatmap image integration ([fd89842](https://github.com/Lenin0/heatmap-react/commit/fd89842))
- **map:** Update map component integration ([7bbf6e6](https://github.com/Lenin0/heatmap-react/commit/7bbf6e6))
- **marker.item:** Update marker tooltip import ([5ee2a84](https://github.com/Lenin0/heatmap-react/commit/5ee2a84))
- **map.config:** Improve map configuration utilities ([a9b33a4](https://github.com/Lenin0/heatmap-react/commit/a9b33a4))

### 📖 Documentation

- **CONTRIBUTING:** Add contribution guidelines ([db76a48](https://github.com/Lenin0/heatmap-react/commit/db76a48))
- **Readme:** Add project documentation ([c868413](https://github.com/Lenin0/heatmap-react/commit/c868413))
- **CONTRIBUTING:** Update contribution guidelines ([71afa74](https://github.com/Lenin0/heatmap-react/commit/71afa74))
- **CONTRIBUTING:** Update contribution guidelines ([ec20563](https://github.com/Lenin0/heatmap-react/commit/ec20563))
- **CONTRIBUTING:** Update contribution guidelines ([190090a](https://github.com/Lenin0/heatmap-react/commit/190090a))

### 📦 Build

- **tsup:** Configure package bundling and output formats ([e196ccd](https://github.com/Lenin0/heatmap-react/commit/e196ccd))
- **package:** Add React typings and package configuration ([30c73f1](https://github.com/Lenin0/heatmap-react/commit/30c73f1))

### 🏡 Chore

- **gitignore:** Update ignored files configuration ([6a79730](https://github.com/Lenin0/heatmap-react/commit/6a79730))
- **package-lock:** Update package lock dependencies ([2cb4914](https://github.com/Lenin0/heatmap-react/commit/2cb4914))
- **gitignore:** Update ignored development files ([30e353f](https://github.com/Lenin0/heatmap-react/commit/30e353f))
- **package-lock:** Update dependency lockfile ([56f6e82](https://github.com/Lenin0/heatmap-react/commit/56f6e82))
- **package:** Add test and build dependencies ([9acb6c2](https://github.com/Lenin0/heatmap-react/commit/9acb6c2))
- **package-lock:** Update dependency lockfile ([266f2ec](https://github.com/Lenin0/heatmap-react/commit/266f2ec))
- **tsconfig:** Add TypeScript project configuration ([1594761](https://github.com/Lenin0/heatmap-react/commit/1594761))
- **tsup:** Configure library build ([5fca7cf](https://github.com/Lenin0/heatmap-react/commit/5fca7cf))
- **package:** Update test scripts ([6000e45](https://github.com/Lenin0/heatmap-react/commit/6000e45))

### ✅ Tests

- **vitest:** Add test runner configuration ([663b3ab](https://github.com/Lenin0/heatmap-react/commit/663b3ab))
- **vitest:** Add test environment setup ([0393aec](https://github.com/Lenin0/heatmap-react/commit/0393aec))
- **hooks:** Add hook behavior tests ([f2ea2af](https://github.com/Lenin0/heatmap-react/commit/f2ea2af))
- **controls:** Add heatmap controls tests ([4430391](https://github.com/Lenin0/heatmap-react/commit/4430391))
- **tooltip.styles:** Add tooltip style tests ([b2665d3](https://github.com/Lenin0/heatmap-react/commit/b2665d3))
- **utils:** Add utility function tests ([5d8f086](https://github.com/Lenin0/heatmap-react/commit/5d8f086))
- **map.config:** Add map configuration tests ([7306b74](https://github.com/Lenin0/heatmap-react/commit/7306b74))
- **map.utils:** Add map utility tests ([258254d](https://github.com/Lenin0/heatmap-react/commit/258254d))
- **tooltip.hook:** Add tooltip hook tests ([33e7a4a](https://github.com/Lenin0/heatmap-react/commit/33e7a4a))

### 🤖 CI

- **tests:** Add automated test workflow ([3458f08](https://github.com/Lenin0/heatmap-react/commit/3458f08))
- **workflow:** Rename tests workflow to ci ([94e5d51](https://github.com/Lenin0/heatmap-react/commit/94e5d51))

### ❤️ Contributors

- Pedro Lenin <pedrolenin06@gmail.com>

