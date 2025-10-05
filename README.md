# Postman ESLint

A CLI tool to lint JavaScript scripts in Postman collections using ESLint.

## Installation

```bash
npm install
```

## Usage

### Basic Usage

```bash
./cli.js --collection <collection-id> --api-key <your-api-key>
```

### Using Environment Variable

You can also set the API key as an environment variable:

```bash
export POSTMAN_API_KEY=your-api-key
./cli.js --collection <collection-id>
```

### Options

- `-c, --collection <id>` (required): Postman collection ID
- `-k, --api-key <key>` (optional): Postman API key (can also use `POSTMAN_API_KEY` environment variable)

## Configuration

The tool uses ESLint configuration from `.eslintrc` files in the standard locations that ESLint supports:

- `.eslintrc.js`
- `.eslintrc.json`
- `.eslintrc.yml`
- `.eslintrc.yaml`
- `eslintrc` field in `package.json`

A sample `.eslintrc.json` is included with Postman-specific globals like `pm` already configured.

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

