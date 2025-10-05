const { ESLint } = require('eslint');
const { lintScripts } = require('../cli');

jest.mock('eslint');

describe('lintScripts', () => {
  let mockESLintInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockESLintInstance = {
      lintText: jest.fn()
    };
    ESLint.mockImplementation(() => mockESLintInstance);
  });

  it('should lint scripts and return results', async () => {
    const scripts = [
      {
        code: 'console.log("hello")',
        scriptPath: 'Test Request [prerequest]'
      }
    ];

    mockESLintInstance.lintText.mockResolvedValue([
      {
        messages: [
          {
            severity: 2,
            message: 'Missing semicolon',
            line: 1,
            column: 21,
            ruleId: 'semi'
          }
        ],
        errorCount: 1,
        warningCount: 0
      }
    ]);

    const results = await lintScripts(scripts);

    expect(mockESLintInstance.lintText).toHaveBeenCalledWith(
      'console.log("hello")',
      { filePath: 'postman-script.js' }
    );

    expect(results).toHaveLength(1);
    expect(results[0].scriptPath).toBe('Test Request [prerequest]');
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe('Missing semicolon');
    expect(results[0].errorCount).toBe(1);
    expect(results[0].warningCount).toBe(0);
  });

  it('should handle multiple scripts', async () => {
    const scripts = [
      {
        code: 'var x = 1',
        scriptPath: 'Request 1 [test]'
      },
      {
        code: 'const y = 2;',
        scriptPath: 'Request 2 [test]'
      }
    ];

    mockESLintInstance.lintText
      .mockResolvedValueOnce([
        {
          messages: [
            {
              severity: 2,
              message: 'Missing semicolon',
              line: 1,
              column: 10,
              ruleId: 'semi'
            }
          ],
          errorCount: 1,
          warningCount: 0
        }
      ])
      .mockResolvedValueOnce([
        {
          messages: [],
          errorCount: 0,
          warningCount: 0
        }
      ]);

    const results = await lintScripts(scripts);

    expect(results).toHaveLength(2);
    expect(results[0].messages).toHaveLength(1);
    expect(results[1].messages).toHaveLength(0);
  });

  it('should handle warnings and errors', async () => {
    const scripts = [
      {
        code: 'const x = "test"',
        scriptPath: 'Test [prerequest]'
      }
    ];

    mockESLintInstance.lintText.mockResolvedValue([
      {
        messages: [
          {
            severity: 1,
            message: 'Strings must use singlequote',
            line: 1,
            column: 11,
            ruleId: 'quotes'
          },
          {
            severity: 2,
            message: 'Missing semicolon',
            line: 1,
            column: 17,
            ruleId: 'semi'
          }
        ],
        errorCount: 1,
        warningCount: 1
      }
    ]);

    const results = await lintScripts(scripts);

    expect(results[0].messages).toHaveLength(2);
    expect(results[0].errorCount).toBe(1);
    expect(results[0].warningCount).toBe(1);
  });

  it('should propagate ESLint errors', async () => {
    const scripts = [
      {
        code: 'some code',
        scriptPath: 'Error Request [test]'
      }
    ];

    mockESLintInstance.lintText.mockRejectedValue(new Error('ESLint configuration error'));

    await expect(lintScripts(scripts)).rejects.toThrow('ESLint configuration error');
  });

  it('should return empty messages for clean code', async () => {
    const scripts = [
      {
        code: 'const x = 1;',
        scriptPath: 'Clean Request [test]'
      }
    ];

    mockESLintInstance.lintText.mockResolvedValue([
      {
        messages: [],
        errorCount: 0,
        warningCount: 0
      }
    ]);

    const results = await lintScripts(scripts);

    expect(results).toHaveLength(1);
    expect(results[0].messages).toHaveLength(0);
    expect(results[0].errorCount).toBe(0);
    expect(results[0].warningCount).toBe(0);
  });
});
