const dreaded = global.dreaded;
const fetch = require('node-fetch');
const Obf = require("javascript-obfuscator");
const { c, cpp, node, python, java } = require('compile-run');

dreaded({
  pattern: "carbon",
  desc: "Carbon command",
  category: "Coding",
  filename: __filename
}, async (context) => {
  const { client, m, text, botname } = context;
  const cap = `Converted By ${botname}`;

  if (m.quoted && m.quoted.text) {
    const code = m.quoted.text;

    try {
      const response = await fetch('https://carbonara.solopov.dev/api/cook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, backgroundColor: '#1F816D' }),
      });

      if (!response.ok) return m.reply('API failed to fetch a valid response.');

      const buffer = await response.buffer();
      await client.sendMessage(m.chat, { image: buffer, caption: cap }, { quoted: m });

    } catch (error) {
      m.reply("An error occurred:\n" + error);
    }
  } else {
    m.reply('Quote a code message');
  }
});

dreaded({
  pattern: "encrypt",
  desc: "Encrypt command",
alias: ["enc", "obf"],
  category: "Coding",
  filename: __filename
}, async ({ m }) => {
  if (m.quoted && m.quoted.text) {
    const code = m.quoted.text;

    const obfuscationResult = Obf.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      numbersToExpressions: true,
      simplify: true,
      stringArrayShuffle: true,
      splitStrings: true,
      stringArrayThreshold: 1
    });

    console.log("Successfully encrypted the code");
    m.reply(obfuscationResult.getObfuscatedCode());
  } else {
    m.reply("Tag a valid JavaScript code to encrypt!");
  }
});

const runners = {
  "runcpp": cpp,
  "runc": c,
  "runjava": java,
  "runjs": node,
  "runpy": python
};

for (const [pattern, engine] of Object.entries(runners)) {
  dreaded({
    pattern,
    desc: `${pattern} command`,
    category: "Coding",
    filename: __filename
  }, async ({ m }) => {
    if (m.quoted && m.quoted.text) {
      const code = m.quoted.text;

      try {
        const result = await engine.runSource(code);
        if (result.stdout) await m.reply(result.stdout);
        if (result.stderr) await m.reply(result.stderr);
      } catch (err) {
        console.error(err);
        m.reply(err?.stderr || 'An error occurred while running code.');
      }

    } else {
      m.reply(`Quote a valid and short ${pattern.replace('run-', '')} code to compile`);
    }
  });
}
