const { Collection } = require('postman-collection');
const { extractScripts } = require('../cli');

describe('extractScripts', () => {
  it('should extract prerequest scripts from collection', () => {
    const collectionData = {
      info: { name: 'Test Collection' },
      event: [
        {
          listen: 'prerequest',
          script: {
            exec: ['console.log("collection prerequest");', 'pm.environment.set("test", "value");']
          }
        }
      ],
      item: []
    };

    const collection = new Collection(collectionData);
    const scripts = extractScripts(collection);

    expect(scripts).toHaveLength(1);
    expect(scripts[0].scriptPath).toBe('Collection [prerequest]');
    expect(scripts[0].code).toContain('console.log("collection prerequest")');
    expect(scripts[0].code).toContain('pm.environment.set("test", "value")');
  });

  it('should extract test scripts from collection', () => {
    const collectionData = {
      info: { name: 'Test Collection' },
      event: [
        {
          listen: 'test',
          script: {
            exec: ['pm.test("Status code is 200", function () {', '  pm.response.to.have.status(200);', '});']
          }
        }
      ],
      item: []
    };

    const collection = new Collection(collectionData);
    const scripts = extractScripts(collection);

    expect(scripts).toHaveLength(1);
    expect(scripts[0].scriptPath).toBe('Collection [test]');
    expect(scripts[0].code).toContain('pm.test');
  });

  it('should extract scripts from request items', () => {
    const collectionData = {
      info: { name: 'Test Collection' },
      item: [
        {
          name: 'Login Request',
          request: 'https://api.example.com/login',
          event: [
            {
              listen: 'prerequest',
              script: {
                exec: ['console.log("login prerequest");']
              }
            },
            {
              listen: 'test',
              script: {
                exec: ['pm.test("Login successful", function () {});']
              }
            }
          ]
        }
      ]
    };

    const collection = new Collection(collectionData);
    const scripts = extractScripts(collection);

    expect(scripts).toHaveLength(2);
    expect(scripts[0].scriptPath).toBe('Test Collection > Login Request [prerequest]');
    expect(scripts[0].code).toContain('console.log("login prerequest")');
    expect(scripts[1].scriptPath).toBe('Test Collection > Login Request [test]');
    expect(scripts[1].code).toContain('pm.test("Login successful"');
  });

  it('should extract scripts from nested folders', () => {
    const collectionData = {
      info: { name: 'Test Collection' },
      item: [
        {
          name: 'Auth Folder',
          item: [
            {
              name: 'Login',
              request: 'https://api.example.com/login',
              event: [
                {
                  listen: 'test',
                  script: {
                    exec: ['console.log("nested test");']
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const collection = new Collection(collectionData);
    const scripts = extractScripts(collection);

    expect(scripts).toHaveLength(1);
    expect(scripts[0].scriptPath).toBe('Test Collection > Auth Folder > Login [test]');
    expect(scripts[0].code).toContain('console.log("nested test")');
  });

  it('should return empty array when no scripts present', () => {
    const collectionData = {
      info: { name: 'Test Collection' },
      item: [
        {
          name: 'No Scripts Request',
          request: 'https://api.example.com/test'
        }
      ]
    };

    const collection = new Collection(collectionData);
    const scripts = extractScripts(collection);

    expect(scripts).toHaveLength(0);
  });

  it('should skip empty or whitespace-only scripts', () => {
    const collectionData = {
      info: { name: 'Test Collection' },
      event: [
        {
          listen: 'test',
          script: {
            exec: ['   ', '']
          }
        }
      ],
      item: []
    };

    const collection = new Collection(collectionData);
    const scripts = extractScripts(collection);

    expect(scripts).toHaveLength(0);
  });

  it('should handle multiple levels of nesting', () => {
    const collectionData = {
      info: { name: 'Test Collection' },
      item: [
        {
          name: 'Level 1',
          item: [
            {
              name: 'Level 2',
              item: [
                {
                  name: 'Deep Request',
                  request: 'https://api.example.com/deep',
                  event: [
                    {
                      listen: 'test',
                      script: {
                        exec: ['console.log("deep");']
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    const collection = new Collection(collectionData);
    const scripts = extractScripts(collection);

    expect(scripts).toHaveLength(1);
    expect(scripts[0].scriptPath).toBe('Test Collection > Level 1 > Level 2 > Deep Request [test]');
  });
});
