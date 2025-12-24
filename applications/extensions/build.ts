Bun.build({
    entrypoints: ["./main.ts"],
    outdir: "./dist",
    minify: true,
    sourcemap: true,
    target: "browser",
})