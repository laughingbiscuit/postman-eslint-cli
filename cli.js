#!/usr/bin/env node
const { program } = require('commander');
const axios = require('axios');
const { Collection } = require('postman-collection');
const { ESLint } = require('eslint');

const fetchCollection = async (collectionId, apiKey) => {
  const { data } = await axios.get(`https://api.getpostman.com/collections/${collectionId}`, {
    headers: { 'X-Api-Key': apiKey }
  });
  return new Collection(data.collection);
};

const extractScripts = (collection) => {
  const scripts = [];
  const extract = (events, path) => {
    events?.each(e => {
      if (e.script?.exec) {
        const code = e.script.toSource();
        if (code?.trim()) scripts.push({ code, scriptPath: `${path} [${e.listen === 'prerequest' ? 'prerequest' : 'test'}]` });
      }
    });
  };
  extract(collection.events, 'Collection');
  collection.forEachItem(item => {
    const path = [];
    let cur = item;
    while (cur) {
      if (cur.name) path.unshift(cur.name);
      cur = cur.parent();
    }
    extract(item.events, path.join(' > '));
  });
  return scripts;
};

const lintScripts = async (scripts) => {
  const eslint = new ESLint();
  return Promise.all(scripts.map(async ({ code, scriptPath }) => {
    const [result] = await eslint.lintText(code, { filePath: 'postman-script.js' });
    return { scriptPath, messages: result.messages, errorCount: result.errorCount, warningCount: result.warningCount };
  }));
};

if (require.main === module) {
  program
    .requiredOption('-c, --collection <id>', 'Postman collection ID')
    .option('-k, --api-key <key>', 'Postman API key (or use POSTMAN_API_KEY env var)')
    .parse();

  const { collection: collectionId, apiKey = process.env.POSTMAN_API_KEY } = program.opts();

  if (!apiKey) {
    console.error('Error: Postman API key required via --api-key or POSTMAN_API_KEY env var');
    process.exit(1);
  }

  (async () => {
    console.log(`Fetching collection ${collectionId}...`);
    const collection = await fetchCollection(collectionId, apiKey);

    console.log('Extracting scripts...');
    const scripts = extractScripts(collection);

    if (!scripts.length) {
      console.log('No scripts found in collection.');
      process.exit(0);
    }

    console.log(`Found ${scripts.length} script(s). Running ESLint...\n`);
    const results = await lintScripts(scripts);

    let totalErrors = 0, totalWarnings = 0, filesWithIssues = 0;

    results.forEach((result, i) => {
      console.log('='.repeat(80));
      console.log(result.scriptPath);
      console.log('='.repeat(80));
      scripts[i].code.split('\n').forEach((line, j) => console.log(`${String(j + 1).padStart(4)} | ${line}`));

      if (result.messages.length) {
        console.log('\n' + '-'.repeat(80));
        console.log('Lint Results:');
        console.log('-'.repeat(80));
        result.messages.forEach(msg => {
          const severity = msg.severity === 2 ? 'error' : 'warning';
          console.log(`  ${msg.line}:${msg.column}  ${severity}  ${msg.message}  ${msg.ruleId || ''}`);
          msg.severity === 2 ? totalErrors++ : totalWarnings++;
        });
        filesWithIssues++;
      } else {
        console.log('\n✓ No issues found');
      }
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total scripts: ${scripts.length}`);
    console.log(`Scripts with issues: ${filesWithIssues}`);
    console.log(`Total errors: ${totalErrors}`);
    console.log(`Total warnings: ${totalWarnings}`);
    console.log(totalErrors || totalWarnings ? `\n✖ ${totalErrors} error(s), ${totalWarnings} warning(s) found` : '\n✓ All scripts passed linting!');

    if (totalErrors) process.exit(1);
  })().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { fetchCollection, extractScripts, lintScripts };
