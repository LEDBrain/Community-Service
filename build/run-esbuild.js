import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/**/**.ts'],
    outdir: './dist',
    platform: 'node',
    packages: 'external',
    format: 'esm',
});
