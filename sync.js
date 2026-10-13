// Salin bank/*.js dan gen.js ke web/data (format ES module). Jalankan: node sync.js
const fs = require("fs");
fs.readdirSync("bank").filter(f => f.endsWith(".js")).forEach(f => {
  const src = fs.readFileSync("bank/" + f, "utf8");
  const out = src.replace(/window\.BANK = window\.BANK \|\| \{\};\r?\nwindow\.BANK\["[^"]+"\] = \[/, "const bank = [");
  if (out === src) throw new Error("header tidak dikenali: " + f);
  fs.writeFileSync("web/data/" + f, out.trimEnd() + "\nexport default bank;\n");
});
fs.copyFileSync("gen.js", "web/data/gen.js");
