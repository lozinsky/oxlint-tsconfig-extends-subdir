import { spawnSync } from 'node:child_process';
import { rmSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const CASES = [
  {
    name: 'extends ./tsconfig.base.json',
    files: {
      './tsconfig.json': {
        extends: './tsconfig.base.json',
      },
      './tsconfig.base.json': {
        compilerOptions: {
          paths: { '@/*': ['./src/*'] },
        },
        include: ['./src'],
      },
    },
  },
  {
    name: 'extends ./subdir/tsconfig.base.json',
    files: {
      './tsconfig.json': {
        extends: './subdir/tsconfig.base.json',
      },
      './subdir/tsconfig.base.json': {
        compilerOptions: {
          paths: { '@/*': ['../src/*'] },
        },
        include: ['../src'],
      },
    },
  },
  {
    name: 'extends ./subdir/tsconfig.base.json, --tsconfig=./tsconfig.json',
    args: ['--tsconfig=./tsconfig.json'],
    files: {
      './tsconfig.json': {
        extends: './subdir/tsconfig.base.json',
      },
      './subdir/tsconfig.base.json': {
        compilerOptions: {
          paths: { '@/*': ['../src/*'] },
        },
        include: ['../src'],
      },
    },
  },
  {
    name: 'extends ./subdir/tsconfig.base.json, include in root',
    files: {
      './tsconfig.json': {
        extends: './subdir/tsconfig.base.json',
        include: ['./src'],
      },
      './subdir/tsconfig.base.json': {
        compilerOptions: {
          paths: { '@/*': ['../src/*'] },
        },
        include: ['../src'],
      },
    },
  },
];

function run(binary, args) {
  const { status, stdout, stderr } = spawnSync(binary, args, { encoding: 'utf8' });

  return { status, output: [stdout, stderr].join('') };
}

for (const { name, files, args = [] } of CASES) {
  for (const [filePath, fileContent] of Object.entries(files)) {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(fileContent));
  }

  const tsc = run('./node_modules/.bin/tsc', ['--noEmit']);
  const oxlint = run('./node_modules/.bin/oxlint', args);
  const cycles = oxlint.output.match(/no-cycle/g)?.length ?? 0;

  for (const filePath of Object.keys(files)) {
    rmSync(filePath, { recursive: true });
  }

  console.log(`${name}`);
  console.log(`  tsc:    ${tsc.status === 0 ? 'OK (paths resolved)' : 'FAIL (paths unresolved)'}`);
  console.log(`  oxlint: ${cycles > 0 ? `${cycles} cycle errors` : 'no cycle errors'}`);
  console.log();
}
