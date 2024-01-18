# [1.6.0](https://github.com/kapetacom/codegen-target/compare/v1.5.2...v1.6.0) (2024-01-18)


### Features

* Adds kaplang helpers to process DSL during codegen ([#20](https://github.com/kapetacom/codegen-target/issues/20)) ([3211b9a](https://github.com/kapetacom/codegen-target/commit/3211b9a46873346da65b48149c524ed088f63c2d))

## [1.5.2](https://github.com/kapetacom/codegen-target/compare/v1.5.1...v1.5.2) (2024-01-03)


### Bug Fixes

* Make sure optional arguments come last ([#19](https://github.com/kapetacom/codegen-target/issues/19)) ([09ade64](https://github.com/kapetacom/codegen-target/commit/09ade6410bb38ec387050a2082695659b667854a))

## [1.5.1](https://github.com/kapetacom/codegen-target/compare/v1.5.0...v1.5.1) (2024-01-02)


### Bug Fixes

* Make sure ref props are strings before treating as type ([#18](https://github.com/kapetacom/codegen-target/issues/18)) ([a303dab](https://github.com/kapetacom/codegen-target/commit/a303dabd379f7e8bd5eae7ba457d41f6f189cbf8))

# [1.5.0](https://github.com/kapetacom/codegen-target/compare/v1.4.1...v1.5.0) (2023-12-30)


### Features

* Adds lastFile to mergeFile method ([#17](https://github.com/kapetacom/codegen-target/issues/17)) ([59393bf](https://github.com/kapetacom/codegen-target/commit/59393bfc33794431c3ca03ac274c776add1ccd44))

## [1.4.1](https://github.com/kapetacom/codegen-target/compare/v1.4.0...v1.4.1) (2023-12-25)


### Bug Fixes

* Include prettier as non-dev dep ([b583edb](https://github.com/kapetacom/codegen-target/commit/b583edb6983e66e8f8c087eaf3575213e27775d4))

# [1.4.0](https://github.com/kapetacom/codegen-target/compare/v1.3.1...v1.4.0) (2023-12-25)


### Features

* Adds prettier wrapper for formatting code ([#16](https://github.com/kapetacom/codegen-target/issues/16)) ([73a88c9](https://github.com/kapetacom/codegen-target/commit/73a88c9315098d2355d26f7e32526ee29175f8f2))

## [1.3.1](https://github.com/kapetacom/codegen-target/compare/v1.3.0...v1.3.1) (2023-12-20)


### Bug Fixes

* #FILENAME header in xml had 'merge-->' as mode ([ea2a7fb](https://github.com/kapetacom/codegen-target/commit/ea2a7fb5e23f491d918eee5af21e9a0ba537acf9))
* add tests ([b69399a](https://github.com/kapetacom/codegen-target/commit/b69399ae4e966f4def20684ae1e8df0c85d2bd4b))
* github actions ci pr build ([3df3146](https://github.com/kapetacom/codegen-target/commit/3df3146b526cb4194f92d812d710ca9f6848c851))

# [1.3.0](https://github.com/kapetacom/codegen-target/compare/v1.2.1...v1.3.0) (2023-11-29)


### Features

* Adds helper for checking if a certain type is referenced ([#14](https://github.com/kapetacom/codegen-target/issues/14)) ([cdd9198](https://github.com/kapetacom/codegen-target/commit/cdd91984331ac5966c0e55fb311600f14b0efaf9))

## [1.2.1](https://github.com/kapetacom/codegen-target/compare/v1.2.0...v1.2.1) (2023-11-20)


### Bug Fixes

* Issues dealing with kapeta uri strings ([#13](https://github.com/kapetacom/codegen-target/issues/13)) ([652a7e9](https://github.com/kapetacom/codegen-target/commit/652a7e947a9453a2cd6fcc5ed69e8a30da912404))

# [1.2.0](https://github.com/kapetacom/codegen-target/compare/v1.1.0...v1.2.0) (2023-11-16)


### Features

* Check for built-in types when iterating dependencies ([#11](https://github.com/kapetacom/codegen-target/issues/11)) ([9fdbc9f](https://github.com/kapetacom/codegen-target/commit/9fdbc9f99be4c0695e686961fa6ac57feea06097))

# [1.1.0](https://github.com/kapetacom/codegen-target/compare/v1.0.3...v1.1.0) (2023-11-15)


### Bug Fixes

* Return undefined instead of null when skipping ([fb2fdb4](https://github.com/kapetacom/codegen-target/commit/fb2fdb49540007f5351dbfe3230a370a0591bcde))


### Features

* Add support for multi file generation from hbs template ([69d39eb](https://github.com/kapetacom/codegen-target/commit/69d39eb720431828e94b9e85b454408320b4b1c2))

## [1.0.3](https://github.com/kapetacom/codegen-target/compare/v1.0.2...v1.0.3) (2023-10-16)

### Bug Fixes

-   Handle switch on non-strings (e.g. SafeString) ([#8](https://github.com/kapetacom/codegen-target/issues/8)) ([d209405](https://github.com/kapetacom/codegen-target/commit/d209405ce7f60eccf7a03773d6193eaa36da8797))

## [1.0.2](https://github.com/kapetacom/codegen-target/compare/v1.0.1...v1.0.2) (2023-09-19)

### Bug Fixes

-   If string is null/undefined just return empty string ([#7](https://github.com/kapetacom/codegen-target/issues/7)) ([272d0e6](https://github.com/kapetacom/codegen-target/commit/272d0e628380b0a4641e8c4216e7a03046cfca2c))

## [1.0.1](https://github.com/kapetacom/codegen-target/compare/v1.0.0...v1.0.1) (2023-06-18)

### Bug Fixes

-   Change yaml-transform to TS to include ([dae0d42](https://github.com/kapetacom/codegen-target/commit/dae0d42512732c107a228674b08479d6da76664d))

# 1.0.0 (2023-06-18)

-   feat!: Added mergeFile method to base target (#6) ([203761b](https://github.com/kapetacom/codegen-target/commit/203761b4cc61cb443ab64b1d43fe7966ae8e42e3)), closes [#6](https://github.com/kapetacom/codegen-target/issues/6)

### BREAKING CHANGES

-   Rewrote to TS and ESM + CJS module
