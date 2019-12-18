import axios from 'axios';

export default class RemoteStore {
  key: string;

  root: string; // Every file operation is relative to this path.

  version: string | null; // System Version

  static get STORE_SETTINGS(): string {
    return '.cardiology';
  }

  static get CONTENT_ENDPOINT(): string {
    return 'https://content.dropboxapi.com';
  }

  static get STD_ENDPOINT(): string {
    return 'https://api.dropboxapi.com';
  }

  constructor(key: string) {
    this.key = key;
    this.root = '/';
    this.version = null;
  }

  async load(): Promise<void> {
    // Clear existing settings
    this.root = '/';

    // load settings file from remote store
    let settings;
    try {
      settings = await this.get(RemoteStore.STORE_SETTINGS);
    } catch {
      throw Error('Initializing remote store failed.');
    }

    // set appropriate variables based on settings
    this.root = settings.root;
    this.version = settings.version;
  }

  /*
   * Get file with given filename from remote store,
   * considering the root directory.
   */
  async get(filename: string): Promise<any> {
    let response;
    try {
      response = await axios.post(
        `${RemoteStore.CONTENT_ENDPOINT}/2/files/download`,
        null,
        {
          headers: {
            Authorization: `Bearer ${this.key}`,
            'Content-Type': 'text/plain',
            'Dropbox-API-Arg': `{ 'path': '${this.root + filename}'}`,
          },
        },
      );
    } catch (e) {
      throw Error('Remote store get operation failed.');
    }

    return response.data;
  }

  async put(data: string, filename: string): Promise<void> {
    try {
      await axios.post('https://content.dropboxapi.com/2/files/upload', data, {
        headers: {
          Authorization: `Bearer ${this.key}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': `{ 'path': '${filename}'}`,
        },
      });
    } catch (e) {
      throw Error(`Putting data in remote store fails. Reason: ${e}.`);
    }
  }

  /*
   * Make directory with given path.
   */
  async mkdir(path: string): Promise<void> {
    return axios.post(
      `${RemoteStore.STD_ENDPOINT}/2/files/create_folder_v2`,
      {
        path,
      },
      {
        headers: {
          Authorization: `Bearer ${this.key}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  /*
   * Delete file with given filename.
   */
  async delete(filename: string): Promise<void> {
    try {
      await axios.post(
        `${RemoteStore.STD_ENDPOINT}/2/files/delete_v2`,
        {
          path: filename,
        },
        {
          headers: {
            Authorization: `Bearer ${this.key}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (e) {
      throw Error(`Failed to delete file. Reason: ${e}`);
    }
  }
}
