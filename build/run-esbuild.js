import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outdir: './dist',
    platform: 'node',
    packages: 'external',
    format: 'esm',
});
