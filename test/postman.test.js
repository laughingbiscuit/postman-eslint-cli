const axios = require('axios');
const { Collection } = require('postman-collection');
const { fetchCollection } = require('../cli');

jest.mock('axios');

describe('fetchCollection', () => {
  const mockApiKey = 'test-api-key';
  const mockCollectionId = 'test-collection-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch collection and return Collection instance', async () => {
    const mockCollectionData = {
      info: {
        name: 'Test Collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: []
    };

    axios.get.mockResolvedValue({
      data: {
        collection: mockCollectionData
      }
    });

    const result = await fetchCollection(mockCollectionId, mockApiKey);

    expect(axios.get).toHaveBeenCalledWith(
      `https://api.getpostman.com/collections/${mockCollectionId}`,
      {
        headers: {
          'X-Api-Key': mockApiKey
        }
      }
    );

    expect(result).toBeInstanceOf(Collection);
    expect(result.name).toBe('Test Collection');
  });

  it('should throw error when API returns error response', async () => {
    const errorResponse = {
      response: {
        status: 404,
        statusText: 'Not Found',
        data: {
          error: {
            message: 'Collection not found'
          }
        }
      }
    };

    axios.get.mockRejectedValue(errorResponse);

    await expect(fetchCollection(mockCollectionId, mockApiKey))
      .rejects.toEqual(errorResponse);
  });

  it('should throw error when network fails', async () => {
    const networkError = new Error('Network error');

    axios.get.mockRejectedValue(networkError);

    await expect(fetchCollection(mockCollectionId, mockApiKey))
      .rejects.toThrow('Network error');
  });

  it('should throw error for other failures', async () => {
    const genericError = new Error('Something went wrong');

    axios.get.mockRejectedValue(genericError);

    await expect(fetchCollection(mockCollectionId, mockApiKey))
      .rejects.toThrow('Something went wrong');
  });
});
