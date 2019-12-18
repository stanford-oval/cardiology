import RemoteStore from './remoteStore';

if (!process.env.TEST_DROPBOX_ACCESSTOKEN) {
  throw Error('Need TEST_DROPBOX_ACCESSTOKEN env variable.');
}

const store = new RemoteStore(process.env.TEST_DROPBOX_ACCESSTOKEN as string);

beforeAll(async () => {
  await store.mkdir('jest-test');
  store.cd('jest-test');
});

afterAll(async () => {
  // Clean up root folder
  await store.delete('');
});

describe('Can make directories', () => {
  test('Can make direct directory.', async () => {
    return expect(store.mkdir('test')).resolves.toBeDefined();
  });

  test('Can make subdirectory.', async () => {
    return expect(store.mkdir('test/sub')).resolves.toBeDefined();
  });
});

describe('Can upload files.', () => {
  test('Can upload normal file.', () => {
    const data = [{ message: 'Hello world.' }];
    return expect(store.put(data, 'test1.json')).resolves.toBeDefined();
  });
});

describe('Can download files.', () => {
  test('Test 1', async () => {
    const data = await store.get('test1.json');
    return expect(data[0].message).toBe('Hello world.');
  });
});

describe('Can delete files.', () => {
  test('Can delete direct file.', async () => {
    await store.delete('test1.json');
    return expect(store.get('test1.json')).rejects.toThrow();
  });
});
