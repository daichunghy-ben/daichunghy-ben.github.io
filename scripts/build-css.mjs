import fs from 'node:fs/promises';
import path from 'node:path';
import CleanCSS from 'clean-css';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'styles');
const OUT_DIR = path.join(ROOT, 'dist', 'styles');

const main = async () => {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = (await fs.readdir(SOURCE_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => entry.name)
    .sort();

  for (const fileName of files) {
    // Use the same minifier directly; the CLI's file watcher is unnecessary.
    const outputPath = path.join(OUT_DIR, fileName);
    const result = new CleanCSS({ rebaseTo: path.dirname(outputPath) })
      .minify([path.join(SOURCE_DIR, fileName)]);
    if (result.errors.length) throw new Error(result.errors.join('\n'));
    await fs.writeFile(outputPath, result.styles, 'utf8');
  }
};

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
