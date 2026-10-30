// Resolve local classic scripts so regression tests exercise the files the page loads.
const fs = require('node:fs');
const path = require('node:path');
module.exports = function pageSource(filename) {
  const absolute = path.resolve(__dirname, '..', filename);
  return fs.readFileSync(absolute, 'utf8').replace(
    /<script\b([^>]*?)\s+src="([^"]+)"([^>]*)><\/script>/g,
    (tag, before, src, after) => {
      // These two helpers are loaded explicitly by the parent-page test harness.
      if (['parent-report.js', 'parent-log-manager.js'].includes(src)) return tag;
      return `<script${before}${after}>${fs.readFileSync(path.resolve(path.dirname(absolute), src), 'utf8')}</script>`;
    }
  );
};
