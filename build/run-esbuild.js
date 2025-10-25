import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/**/**.ts'],
    outdir: './dist/src',
    platform: 'node',
    packages: 'external',
    format: 'esm',
    bundle: true,
});
