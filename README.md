# oxlint-tsconfig-extends-subdir

https://github.com/oxc-project/oxc/issues/25790

## Steps

1. Run `npm i`
2. Run `npm run reproduce`

Every case runs `tsc --noEmit` and `oxlint` against the same `src/a.ts` <-> `src/b.ts` cycle
imported through `@/*`, changing only where the config declaring `paths` and `include` lives.

## Actual result

```
extends ./tsconfig.base.json
  tsc:    OK (paths resolved)
  oxlint: 2 cycle errors

extends ./subdir/tsconfig.base.json
  tsc:    OK (paths resolved)
  oxlint: no cycle errors

extends ./subdir/tsconfig.base.json, --tsconfig=./tsconfig.json
  tsc:    OK (paths resolved)
  oxlint: 2 cycle errors

extends ./subdir/tsconfig.base.json, include in root
  tsc:    OK (paths resolved)
  oxlint: 2 cycle errors
```

## Expected result

`oxlint` should report the cycle in every case, like `tsc` resolves the paths in every case.

Only `extends ./subdir/tsconfig.base.json` disagrees: the extended config lives in a
subdirectory and declares `include`. Moving `include` to the root config, or passing
`--tsconfig` explicitly, makes the same setup work.
