// Charge l’appli construite (dist/index.html) dans jsdom, avec les fonctions utiles au manuel.
const fs = require('fs'), path = require('path'); const { JSDOM } = require(path.join(__dirname, '..', 'test', 'node_modules', 'jsdom'));
module.exports = function load() {
  let html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'index.html'), 'utf8');
  html = html.replace(/"supabaseUrl":"[^"]*"/, '"supabaseUrl":""');
  html = html.replace(/\ninit\(\);\s*<\/script>/, `\nwindow.__T={MODS,MOD,W,WORDS,N2,GENS,makeCalc,answerShow,plain,renderIll,toInf,INF_PAIRS,ANNEE};\ninit();\n</script>`);
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://tom-rougeaud.github.io/fls3/#/', pretendToBeVisual: true, beforeParse(w) {
    w.fetch = () => Promise.reject(new Error('offline')); w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = function () {}; w.print = () => {};
    w.speechSynthesis = { getVoices: () => [], speak: () => {}, cancel: () => {}, addEventListener: () => {} }; w.SpeechSynthesisUtterance = function (t) { this.text = t; };
    w.Audio = function () { return { play: () => Promise.resolve(), pause() {}, set src(v) {}, get src() { return ''; } }; };
    w.confirm = () => true; w.alert = () => {}; w.console.warn = () => {};
  } });
  if (!dom.window.__T) throw new Error('scripts non chargés');
  return dom;
};
