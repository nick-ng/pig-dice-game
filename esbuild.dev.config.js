const { htmlPlugin } = require("@craftamap/esbuild-plugin-html");
require("esbuild")
  .build({
    entryPoints: ["src-front/index.tsx"],
    bundle: true,
    metafile: true,
    format: "esm",
    // sourcemap: true,
    outdir: "dist-front/",
    plugins: [
      htmlPlugin({
        files: [
          {
            filename: "index.html",
            entryPoints: ["src-front/index.tsx"],
            title: "Pig Dice Game - Dev",
            htmlTemplate: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
        <div id="root"></div>
        </body>
      </html>`,
          },
        ],
      }),
    ],
  })
  .catch(() => process.exit(1));
