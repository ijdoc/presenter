// Content scripts cannot be ES modules, so this classic script imports the real entry point.
// The module files are listed under web_accessible_resources in manifest.json for this reason.
(async () => {
  const { main } = await import(chrome.runtime.getURL("src/content/main.js"));
  main();
})();
