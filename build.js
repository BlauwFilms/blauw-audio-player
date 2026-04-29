#!/usr/bin/env node
/**
 * Simple build script — copies src/ to dist/ and produces minified versions.
 * Run with: node build.js
 *
 * No external dependencies required.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/;}/g, '}')
    .trim();
}

function minifyJS(js) {
  const header = '/*! Blauw Audio Player | MIT License | github.com/BlauwFilms/blauw-audio-player */\n';
  // Strip the source's top comment block
  js = js.replace(/^\s*\/\*\*[\s\S]*?\*\//, '');
  // Strip remaining block comments
  js = js.replace(/\/\*[\s\S]*?\*\//g, '');
  // Strip line comments
  js = js.replace(/^\s*\/\/.*$/gm, '');
  // Collapse blank lines and trim
  js = js.replace(/\n\s*\n/g, '\n');
  js = js.replace(/^\s+/gm, '');
  js = js.replace(/\s+$/gm, '');
  return header + js;
}

function build() {
  const cssIn = fs.readFileSync(path.join(SRC, 'blauw-audio-player.css'), 'utf8');
  const jsIn = fs.readFileSync(path.join(SRC, 'blauw-audio-player.js'), 'utf8');

  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);

  fs.writeFileSync(path.join(DIST, 'blauw-audio-player.css'), cssIn);
  fs.writeFileSync(path.join(DIST, 'blauw-audio-player.js'), jsIn);
  fs.writeFileSync(path.join(DIST, 'blauw-audio-player.min.css'), minifyCSS(cssIn));
  fs.writeFileSync(path.join(DIST, 'blauw-audio-player.min.js'), minifyJS(jsIn));

  console.log('Built dist/');
  console.log('  CSS:', cssIn.length, '→ min:', fs.readFileSync(path.join(DIST, 'blauw-audio-player.min.css'), 'utf8').length);
  console.log('  JS: ', jsIn.length, '→ min:', fs.readFileSync(path.join(DIST, 'blauw-audio-player.min.js'), 'utf8').length);
}

build();
