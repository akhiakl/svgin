# Changelog

## [0.1.3](https://github.com/akhiakl/svgin/compare/svgin-element-v0.1.2...svgin-element-v0.1.3) (2026-09-21)


### Documentation

* **element:** document CDN-only usage (no build tool) ([e5f356c](https://github.com/akhiakl/svgin/commit/e5f356c09e4515677ff50f82a174b0318afb8377))
* **element:** document CDN-only usage (no build tool) ([c468f97](https://github.com/akhiakl/svgin/commit/c468f975da13773999c105f6ba1790e273c4f172))

## [0.1.2](https://github.com/akhiakl/svgin/compare/svgin-element-v0.1.1...svgin-element-v0.1.2) (2026-09-21)


### Documentation

* sync every doc with the actual post-publish state ([cc6c4de](https://github.com/akhiakl/svgin/commit/cc6c4dec282ec6170c7bf015dd0191bdd18636e4))
* sync every doc with the actual post-publish state ([db7d867](https://github.com/akhiakl/svgin/commit/db7d8679177e67a8f2c03f3c4f158faf9af38b96))

## [0.1.1](https://github.com/akhiakl/svgin/compare/svgin-element-v0.1.0...svgin-element-v0.1.1) (2026-09-21)


### Bug Fixes

* **publish:** add repository field, required for npm provenance verification ([f99ef75](https://github.com/akhiakl/svgin/commit/f99ef7553aee74afcf1c769e3c46d641795e4a55))
* **publish:** add repository field, required for npm provenance verification ([7a33e9c](https://github.com/akhiakl/svgin/commit/7a33e9c61d11a4889f02434b04e3ad302a10cce3))

## [0.1.0](https://github.com/akhiakl/svgin/compare/svgin-element-v0.0.1...svgin-element-v0.1.0) (2026-09-21)


### Features

* **element:** implement the real svg-in custom element ([#33](https://github.com/akhiakl/svgin/issues/33)) ([d6f0b29](https://github.com/akhiakl/svgin/commit/d6f0b29a2ea72e8190cc776860b6b82f62304c9e))
* **element:** mark svgin-element public for its first npm publish ([#50](https://github.com/akhiakl/svgin/issues/50)) ([6559ba3](https://github.com/akhiakl/svgin/commit/6559ba376bfbb5241d28ed969788c3484dbf3305))
* **lint:** enable type-checked linting, strict-boolean-expressions ([#35](https://github.com/akhiakl/svgin/issues/35)) ([e0cb75e](https://github.com/akhiakl/svgin/commit/e0cb75e7cea548c849587b39e6039f5bb761dff9))
* migrate svgin-react and svgin-element to [@svgin](https://github.com/svgin) npm scope ([#83](https://github.com/akhiakl/svgin/issues/83)) ([12d3495](https://github.com/akhiakl/svgin/commit/12d34958dd9fb5831febc4a2ea945c9b077f9c25))
* migrate svgin-react onto a new svgin-core, split framework-agnostic internals ([#17](https://github.com/akhiakl/svgin/issues/17)) ([2095910](https://github.com/akhiakl/svgin/commit/20959109ad945ceee028ec0b495620b25a383941))
* wire real bundle-size budget checks into the turbo size task ([#28](https://github.com/akhiakl/svgin/issues/28)) ([fe014e9](https://github.com/akhiakl/svgin/commit/fe014e9cc67d55d5255daa89a5f801c07fdc096f))


### Bug Fixes

* add shebang to commit-msg hook, fix dual ESM/CJS package exports ([a426b7f](https://github.com/akhiakl/svgin/commit/a426b7fda06722f046e6c8e27d67f893248918e2))
* **element:** bump to 0.0.1, npm blocks 0.0.0 republish for 24h ([#82](https://github.com/akhiakl/svgin/issues/82)) ([84ae667](https://github.com/akhiakl/svgin/commit/84ae66742e57a02881045291955f328b14bb08c1))
* move svgin-core to devDependencies, it's bundled not runtime ([#81](https://github.com/akhiakl/svgin/issues/81)) ([804db98](https://github.com/akhiakl/svgin/commit/804db989aaadefe85e1446dfdbfa18286075b475))
* **react:** actually bundle svgin-core into the published output ([#31](https://github.com/akhiakl/svgin/issues/31)) ([4c43d73](https://github.com/akhiakl/svgin/commit/4c43d736a29646d57e706f519ade9938fc96f917))


### Code Refactoring

* extract eslint/typescript/tsup config into workspace packages ([2dba703](https://github.com/akhiakl/svgin/commit/2dba703aae70050227ba2e736ce51b435e2554dc))


### Documentation

* overhaul root and package READMEs; cross-link svgin-react/svgin-element ([#36](https://github.com/akhiakl/svgin/issues/36)) ([90c2bed](https://github.com/akhiakl/svgin/commit/90c2bed75804fe838cc771e59fbec43c0a578846))
* update READMEs/skill for the completed [@svgin](https://github.com/svgin) scoped publish ([0bd1d02](https://github.com/akhiakl/svgin/commit/0bd1d022ec3b0b6d34d7f00755fe9a3e609629e9))
* update READMEs/skill for the completed [@svgin](https://github.com/svgin) scoped publish ([#85](https://github.com/akhiakl/svgin/issues/85)) ([3ff8835](https://github.com/akhiakl/svgin/commit/3ff8835db1bd03e8954639aefe272314c6c8f5a9))
