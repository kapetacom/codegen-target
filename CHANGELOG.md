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