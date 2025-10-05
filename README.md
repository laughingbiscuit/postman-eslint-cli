# Postman ESLint

A CLI tool to lint JavaScript scripts in Postman collections using ESLint.

## Installation

Install globally to use from anywhere:

```bash
npm install -g postman-eslint
```

Or use locally in your project:

```bash
npm install --save-dev postman-eslint
```

## Usage

Run `postman-eslint` from your project directory (where your `eslint.config.js` is located):

```bash
postman-eslint --collection <collection-id> --api-key <your-api-key>
```

Or run without installing using npx:

```bash
npx postman-eslint --collection <collection-id> --api-key <your-api-key>
```

### Options

- `-c, --collection <id>` (required): Postman collection ID
- `-k, --api-key <key>` (optional): Postman API key (can also use `POSTMAN_API_KEY` environment variable)

## Configuration

The tool uses ESLint's flat config format (`eslint.config.js`) from your project root. ESLint will automatically discover this file when running.

A sample `eslint.config.js` is included with this package that has Postman-specific globals like `pm` already configured.

### If You Don't Have an ESLint Config

If you don't have an `eslint.config.js` in your project, you can:

1. **Copy the included sample config:**

   If installed locally:
   ```bash
   cp node_modules/postman-eslint/eslint.config.js ./
   ```

   If installed globally:
   ```bash
   cp "$(npm root -g)/postman-eslint/eslint.config.js" ./
   ```

2. **Create your own** `eslint.config.js`:
   ```javascript
   module.exports = [
     {
       languageOptions: {
         ecmaVersion: 'latest',
         globals: {
           pm: 'readonly',
           console: 'readonly'
         }
       },
       rules: {
         'semi': ['error', 'always'],
         'quotes': ['warn', 'single']
       }
     }
   ];
   ```

3. **Or install and use a preset** like `@eslint/js`:
   ```bash
   npm install --save-dev @eslint/js
   ```
   Then create `eslint.config.js`:
   ```javascript
   const js = require('@eslint/js');

   module.exports = [
     js.configs.recommended,
     {
       languageOptions: {
         globals: { pm: 'readonly' }
       }
     }
   ];
   ```

## How It Works

1. Fetches the collection from Postman API using the provided collection ID and API key
2. Parses the collection using the official [Postman Collection SDK](https://www.npmjs.com/package/postman-collection)
3. Extracts all JavaScript scripts from:
   - Collection-level pre-request scripts
   - Collection-level test scripts
   - Folder-level pre-request scripts
   - Folder-level test scripts
   - Request-level pre-request scripts
   - Request-level test scripts
4. Runs ESLint against each script using your local ESLint configuration
5. Reports any errors or warnings found

## Getting Your Collection ID

1. Open your collection in Postman
2. Click the "..." menu on the collection
3. Select "Share Collection"
4. The collection ID is in the URL: `https://www.postman.com/collections/{collection-id}`

Alternatively, you can find it in the collection's info section.

## Getting Your API Key

1. Go to [Postman API Keys](https://web.postman.co/settings/me/api-keys)
2. Click "Generate API Key"
3. Give it a name and copy the key

## Development

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

The project includes comprehensive tests for all modules:
- `test/postman.test.js` - Tests for Postman API client
- `test/extract.test.js` - Tests for script extraction logic
- `test/eslint.test.js` - Tests for ESLint runner

## Exit Codes

- `0`: No errors found
- `1`: Errors found or execution failed

## Example Output

```
Fetching collection abc123...
Extracting scripts...
Found 3 script(s). Running ESLint...

================================================================================
My Collection > Login Request [prerequest]
================================================================================
   1 | const username = "admin"
   2 | const password = "secret123"
   3 | pm.environment.set("username", username)
   4 | console.log("Setting credentials")

--------------------------------------------------------------------------------
Lint Results:
--------------------------------------------------------------------------------
  1:18  warning  Strings must use singlequote  quotes
  2:18  warning  Strings must use singlequote  quotes
  3:1   error    Missing semicolon  semi
  4:1   error    Missing semicolon  semi

================================================================================
My Collection > Login Request [test]
================================================================================
   1 | pm.test("Status code is 200", function () {
   2 |   pm.response.to.have.status(200);
   3 | });

✓ No issues found

================================================================================
SUMMARY
================================================================================
Total scripts: 3
Scripts with issues: 1
Total errors: 2
Total warnings: 2

✖ 2 error(s), 2 warning(s) found
```

# Disclaimer

This is a community project and not an official Postman product.
