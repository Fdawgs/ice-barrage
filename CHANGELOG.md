# Changelog

## [1.0.1](https://github.com/Fdawgs/ice-barrage/compare/v1.0.0...v1.0.1) (2026-07-12)


### Bug fixes

* **index:** iterate over obj rather than recurse to stop stack overflow ([#20](https://github.com/Fdawgs/ice-barrage/issues/20)) ([ba84078](https://github.com/Fdawgs/ice-barrage/commit/ba8407858565a277f160fbe17dede6be695f6494))
* **index:** throw `TypeError` on invalid arg ([#15](https://github.com/Fdawgs/ice-barrage/issues/15)) ([09bb9f9](https://github.com/Fdawgs/ice-barrage/commit/09bb9f96051db979a2114cfb9997b239235ffbac))
* **index:** use prop descriptors to avoid accessor side effects ([#19](https://github.com/Fdawgs/ice-barrage/issues/19)) ([8a58c5b](https://github.com/Fdawgs/ice-barrage/commit/8a58c5bcbef98512c68bfbb99e631a7a3f25dac1))


### Continuous integration

* add ossf scorecard workflow ([#53](https://github.com/Fdawgs/ice-barrage/issues/53)) ([b4b0cc4](https://github.com/Fdawgs/ice-barrage/commit/b4b0cc41f551c464895abad7dffdd6045096d6f5))
* **cd:** make provenance publishing explicit ([#14](https://github.com/Fdawgs/ice-barrage/issues/14)) ([ace92c1](https://github.com/Fdawgs/ice-barrage/commit/ace92c18309c48838766968b4b41c754101e1e62))
* **ci:** use reusable code quality workflow ([#31](https://github.com/Fdawgs/ice-barrage/issues/31)) ([ff1c240](https://github.com/Fdawgs/ice-barrage/commit/ff1c240c5d3a72b1c2c6bbf209ef69531785b45b))
* **deps:** bump actions/dependency-review-action from 4.8.2 to 4.8.3 ([#16](https://github.com/Fdawgs/ice-barrage/issues/16)) ([987f558](https://github.com/Fdawgs/ice-barrage/commit/987f558f3d4853ac1532048f7a1295e128fc0d54))
* **deps:** bump actions/dependency-review-action from 4.8.3 to 4.9.0 ([#25](https://github.com/Fdawgs/ice-barrage/issues/25)) ([5c21f61](https://github.com/Fdawgs/ice-barrage/commit/5c21f6126921caf8dac295803e0c82ec2db13b5a))
* **deps:** bump fastify/github-action-merge-dependabot ([#28](https://github.com/Fdawgs/ice-barrage/issues/28)) ([89eb1f6](https://github.com/Fdawgs/ice-barrage/commit/89eb1f616527d298681de628ee637a45b964954a))
* **deps:** bump fastify/github-action-merge-dependabot ([#60](https://github.com/Fdawgs/ice-barrage/issues/60)) ([8fdcbda](https://github.com/Fdawgs/ice-barrage/commit/8fdcbda06bc7263ce3631d8dd747466afcd394b3))
* **deps:** bump fdawgs/workflows/.github/workflows/reusable-code-quality.yml ([#46](https://github.com/Fdawgs/ice-barrage/issues/46)) ([87b9069](https://github.com/Fdawgs/ice-barrage/commit/87b9069b4f09ea662fd2356e541995df5fdd6bfb))
* **deps:** bump fdawgs/workflows/.github/workflows/reusable-link-check.yml ([#47](https://github.com/Fdawgs/ice-barrage/issues/47)) ([c4f8aba](https://github.com/Fdawgs/ice-barrage/commit/c4f8aba6006660d955bd53ff0a7c836f5f3d237c))
* **deps:** bump fdawgs/workflows/.github/workflows/reusable-lock-threads.yml ([#48](https://github.com/Fdawgs/ice-barrage/issues/48)) ([ebfb6e4](https://github.com/Fdawgs/ice-barrage/commit/ebfb6e473035a01b6f61cd90c139e41a5273ac9c))
* **deps:** bump github/codeql-action in the github-owned group ([#45](https://github.com/Fdawgs/ice-barrage/issues/45)) ([09ff5cd](https://github.com/Fdawgs/ice-barrage/commit/09ff5cd670e0960583152f98d6dc69f636859bd9))
* **deps:** bump googleapis/release-please-action from 4.4.0 to 5.0.0 ([#27](https://github.com/Fdawgs/ice-barrage/issues/27)) ([2ff583c](https://github.com/Fdawgs/ice-barrage/commit/2ff583c324c4d9cc4f08a711ec4564e84d9811a5))
* **deps:** bump the fdawgs-owned group across 1 directory with 3 updates ([#59](https://github.com/Fdawgs/ice-barrage/issues/59)) ([b964311](https://github.com/Fdawgs/ice-barrage/commit/b96431104f150e6ed20540d18117907376f62730))
* **deps:** bump the fdawgs-owned group with 3 updates ([#51](https://github.com/Fdawgs/ice-barrage/issues/51)) ([7dedf23](https://github.com/Fdawgs/ice-barrage/commit/7dedf23b57fd9ba55b9e4c7966589360954fc1e1))
* **deps:** bump the fdawgs-owned group with 4 updates ([#68](https://github.com/Fdawgs/ice-barrage/issues/68)) ([017dfdb](https://github.com/Fdawgs/ice-barrage/commit/017dfdb1297f26c02f065435e595caab32324cd8))
* **deps:** bump the github-owned group across 1 directory with 3 updates ([#63](https://github.com/Fdawgs/ice-barrage/issues/63)) ([280de2a](https://github.com/Fdawgs/ice-barrage/commit/280de2aaf27e39bb92f5dd326d254122f15517c4))
* **deps:** bump the github-owned group with 2 updates ([#69](https://github.com/Fdawgs/ice-barrage/issues/69)) ([a42478f](https://github.com/Fdawgs/ice-barrage/commit/a42478f42283ad2a9f53dda4034c874d44f6a43d))
* **link-check:** use sha instead of tag ([#32](https://github.com/Fdawgs/ice-barrage/issues/32)) ([f60cca3](https://github.com/Fdawgs/ice-barrage/commit/f60cca32576b4d0b9354a3c6ad33399ecb5779f4))
* **lock-threads:** reduce frequency from daily to monthly ([#35](https://github.com/Fdawgs/ice-barrage/issues/35)) ([d3a6cbe](https://github.com/Fdawgs/ice-barrage/commit/d3a6cbeb1a4003d55a1948159662014eb5a247b9))
* use full-length commit sha for github owned actions ([#42](https://github.com/Fdawgs/ice-barrage/issues/42)) ([4385911](https://github.com/Fdawgs/ice-barrage/commit/4385911e6b497c52a00d44484a719ca1f2c93a6e))


### Dependencies

* **.devcontainer:** add lockfile; use bookworm for base image ([#36](https://github.com/Fdawgs/ice-barrage/issues/36)) ([9538552](https://github.com/Fdawgs/ice-barrage/commit/953855230d3900019b050bc3d0f584332543c45c))
* **dependabot:** add cooldown for actions and devcontainers ([#44](https://github.com/Fdawgs/ice-barrage/issues/44)) ([675e4f0](https://github.com/Fdawgs/ice-barrage/commit/675e4f0cac2eed2a107d46c4c1c40ea7e01d9264))
* **dependabot:** group github-owned updates ([#33](https://github.com/Fdawgs/ice-barrage/issues/33)) ([d15d814](https://github.com/Fdawgs/ice-barrage/commit/d15d814749ce94e36ccbe84d89977bef8c4d210f))
* **dependabot:** remove redundant includes cooldown array ([#66](https://github.com/Fdawgs/ice-barrage/issues/66)) ([4657875](https://github.com/Fdawgs/ice-barrage/commit/4657875d5e62d5d97f94a6806e7fefefbbfa03c5))
* **deps-dev:** bump @types/node from 24.10.4 to 25.0.3 ([#10](https://github.com/Fdawgs/ice-barrage/issues/10)) ([cf7c0fc](https://github.com/Fdawgs/ice-barrage/commit/cf7c0fcb71320783455d16fa77c1857bff3b129f))
* **deps-dev:** bump @types/node from 25.9.4 to 26.0.0 ([#62](https://github.com/Fdawgs/ice-barrage/issues/62)) ([ba8b863](https://github.com/Fdawgs/ice-barrage/commit/ba8b863ca6a40012e9df48e701b8cac612f38f59))
* **deps-dev:** bump c8 from 10.1.3 to 11.0.0 ([#18](https://github.com/Fdawgs/ice-barrage/issues/18)) ([74de5b6](https://github.com/Fdawgs/ice-barrage/commit/74de5b65211f830fc5f86cdcd6820d48a15dd203))
* **deps-dev:** bump licensee from 11.1.1 to 12.0.1 ([#11](https://github.com/Fdawgs/ice-barrage/issues/11)) ([6161dba](https://github.com/Fdawgs/ice-barrage/commit/6161dba7e1e18726214a22d8389b779a84f3e011))
* **deps-dev:** bump prettier from 3.6.2 to 3.8.4 ([#61](https://github.com/Fdawgs/ice-barrage/issues/61)) ([8eda33d](https://github.com/Fdawgs/ice-barrage/commit/8eda33de7a84c826b0e6e2de9c7cc57fae901c68))
* **deps-dev:** bump prettier from 3.8.4 to 3.8.5 ([#67](https://github.com/Fdawgs/ice-barrage/issues/67)) ([8c8709a](https://github.com/Fdawgs/ice-barrage/commit/8c8709ad5da7b73d7a4cc732451f91ab30a5711b))
* **deps-dev:** bump the eslint group across 1 directory with 2 updates ([#40](https://github.com/Fdawgs/ice-barrage/issues/40)) ([ea474f7](https://github.com/Fdawgs/ice-barrage/commit/ea474f7c5022a9096c2be795d3b41c435ab6baa5))
* **deps-dev:** bump typescript from 5.9.3 to 6.0.3 ([#29](https://github.com/Fdawgs/ice-barrage/issues/29)) ([ca384a4](https://github.com/Fdawgs/ice-barrage/commit/ca384a41e57c8770d28656c988fde9deee963e1f))
* **deps-dev:** pin prettier ([#55](https://github.com/Fdawgs/ice-barrage/issues/55)) ([166c7e3](https://github.com/Fdawgs/ice-barrage/commit/166c7e3ecb5218979c45e1baafe085ae7446c231))


### Documentation

* fix broken links ([#57](https://github.com/Fdawgs/ice-barrage/issues/57)) ([0709bb9](https://github.com/Fdawgs/ice-barrage/commit/0709bb98b709fcfec1b4068ad4c98f62e997d5ba))
* **readme:** add strict directive to cjs examples ([#65](https://github.com/Fdawgs/ice-barrage/issues/65)) ([6941c4b](https://github.com/Fdawgs/ice-barrage/commit/6941c4b97dc45637c6e3740f4997ad599661fb80))
* **readme:** flesh out differences ([#21](https://github.com/Fdawgs/ice-barrage/issues/21)) ([7cb6aca](https://github.com/Fdawgs/ice-barrage/commit/7cb6aca54aeb26ec1146be31ec72dfe74c601ba1))
* **readme:** use shell over bash for command examples ([#23](https://github.com/Fdawgs/ice-barrage/issues/23)) ([e43f488](https://github.com/Fdawgs/ice-barrage/commit/e43f488aa4f7de045693f4fd96f65a915c3fa280))


### Improvements

* **index:** reduce traversal allocations with per-key descriptors ([#64](https://github.com/Fdawgs/ice-barrage/issues/64)) ([acc49eb](https://github.com/Fdawgs/ice-barrage/commit/acc49eb1dbad6caabd9b0641d12086ababfe308b))


### Miscellaneous

* **.npmrc:** add min-release-age ([#30](https://github.com/Fdawgs/ice-barrage/issues/30)) ([ffe35ec](https://github.com/Fdawgs/ice-barrage/commit/ffe35ec1908d124ea66f041444e652bc28f63963))
* **.nvmrc:** remove redundant prefix ([#37](https://github.com/Fdawgs/ice-barrage/issues/37)) ([87fac60](https://github.com/Fdawgs/ice-barrage/commit/87fac600c5d0d7fe75512a26591c317313018299))
* **.vscode:** remove redundant javascript default formatter ([#50](https://github.com/Fdawgs/ice-barrage/issues/50)) ([1937ff2](https://github.com/Fdawgs/ice-barrage/commit/1937ff23f29c4d688bf3b1856365b33fc6281d5b))
* **.vscode:** update js and telemetry settings ([#24](https://github.com/Fdawgs/ice-barrage/issues/24)) ([82e74fe](https://github.com/Fdawgs/ice-barrage/commit/82e74fe2545ebd603dd2a768b25b8845ec4c1a9c))
* add missing description and author jsdoc tags ([#34](https://github.com/Fdawgs/ice-barrage/issues/34)) ([5861866](https://github.com/Fdawgs/ice-barrage/commit/58618660c30520d79afc404c736a19aaf5a31465))
* align editorconfig and prettier ignore rules ([#54](https://github.com/Fdawgs/ice-barrage/issues/54)) ([3636fb2](https://github.com/Fdawgs/ice-barrage/commit/3636fb2445ac3d20c89f80afb39d8c8aa3885d62))
* **eslint.config:** `includeIgnoreFile` from `eslint/config` ([#49](https://github.com/Fdawgs/ice-barrage/issues/49)) ([b374ceb](https://github.com/Fdawgs/ice-barrage/commit/b374ceb8b64ac050bef4a8b5a62c3683a5f0271c))
* **index:** add missing author jsdoc tag ([#8](https://github.com/Fdawgs/ice-barrage/issues/8)) ([4d93fe2](https://github.com/Fdawgs/ice-barrage/commit/4d93fe2a35d84711f515c6029f0dd1f88cb498b9))
* **index:** restore inline comment ([#22](https://github.com/Fdawgs/ice-barrage/issues/22)) ([406201f](https://github.com/Fdawgs/ice-barrage/commit/406201f2107e962e1c8ba491a62f1efbfc9762b6))
* **license:** add contact email ([#12](https://github.com/Fdawgs/ice-barrage/issues/12)) ([a715d6b](https://github.com/Fdawgs/ice-barrage/commit/a715d6b63c0421f77ba94210374e8311a367b2a0))
* **package:** stop running `lint:prettier` twice on `test` call ([#13](https://github.com/Fdawgs/ice-barrage/issues/13)) ([16c1cc3](https://github.com/Fdawgs/ice-barrage/commit/16c1cc385797725a7c6ca1ff141d7e0a854048ac))
* replace http links with https ([#58](https://github.com/Fdawgs/ice-barrage/issues/58)) ([a2f97a6](https://github.com/Fdawgs/ice-barrage/commit/a2f97a6991346fa7f183506aa5a9e6af17d9d2a9))

## [1.0.0](https://github.com/Fdawgs/ice-barrage/compare/v0.0.1...v1.0.0) (2025-12-02)


### ⚠ BREAKING CHANGES

* v1.0.0 stable ([#7](https://github.com/Fdawgs/ice-barrage/issues/7))

### Continuous integration

* **deps:** bump actions/checkout from 5 to 6 ([#5](https://github.com/Fdawgs/ice-barrage/issues/5)) ([8c72e3d](https://github.com/Fdawgs/ice-barrage/commit/8c72e3d5002e99716b73c3c3e15357768b72962d))
* **deps:** bump actions/dependency-review-action from 4.8.1 to 4.8.2 ([#3](https://github.com/Fdawgs/ice-barrage/issues/3)) ([2ad3f82](https://github.com/Fdawgs/ice-barrage/commit/2ad3f821381c24c9cb25877dc568b613b37d9c49))
* **deps:** bump coverallsapp/github-action from 2.3.6 to 2.3.7 ([#4](https://github.com/Fdawgs/ice-barrage/issues/4)) ([853d343](https://github.com/Fdawgs/ice-barrage/commit/853d3434cfbe142dae3a3b50481144a667340c9b))


### Dependencies

* **deps-dev:** bump @eslint/compat in the eslint group ([#6](https://github.com/Fdawgs/ice-barrage/issues/6)) ([bf5d304](https://github.com/Fdawgs/ice-barrage/commit/bf5d304630a582950f1a5d954517f9c9ecbf0226))


### Miscellaneous

* v1.0.0 stable ([#7](https://github.com/Fdawgs/ice-barrage/issues/7)) ([3f70b5c](https://github.com/Fdawgs/ice-barrage/commit/3f70b5c65102d1d3271580150996d5a7e4952d24))
