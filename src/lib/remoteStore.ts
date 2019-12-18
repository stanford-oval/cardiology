import axios from 'axios';
import path from 'path';

export default class RemoteStore {
  key: string;

  currentDir: string; // Every file operation is relative to this path.

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
    this.currentDir = '/';
    this.version = null;
  }

  cd(dir: string): void {
    this.currentDir = this.getPath(dir);
  }

  // Returns absolute path given relative path
  getPath(to: string): string {
    // path.resolve handles . and ..
    return path.resolve(this.currentDir, to);
  }

  async load(): Promise<void> {
    // Clear existing settings
    this.currentDir = '/';

    // load settings file from remote store
    let settings;
    try {
      settings = await this.get(RemoteStore.STORE_SETTINGS);
    } catch {
      throw Error('Initializing remote store failed.');
    }

    // set appropriate variables based on settings
    this.currentDir = settings.root;
    this.version = settings.version;
  }

  /*
   * Get file with given filename from remote store,
   * considering the root directory.
   */
  async get(filename: string): Promise<any> {
    const apiArgs = {
      path: this.getPath(filename),
    };

    let response;
    try {
      response = await axios.post(
        `${RemoteStore.CONTENT_ENDPOINT}/2/files/download`,
        null,
        {
          headers: {
            Authorization: `Bearer ${this.key}`,
            'Content-Type': 'text/plain',
            'Dropbox-API-Arg': JSON.stringify(apiArgs),
          },
        },
      );
    } catch (e) {
      throw Error(`Remote store get operation failed. Reason: ${e}`);
    }

    return response.data;
  }

  async put(data: any, filename: string): Promise<void> {
    const apiArgs = {
      path: this.getPath(filename),
      mode: 'overwrite',
      strict_conflict: true, // eslint-disable-line
    };

    try {
      return await axios.post(
        `${RemoteStore.CONTENT_ENDPOINT}/2/files/upload`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.key}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify(apiArgs),
          },
        },
      );
    } catch (e) {
      throw Error(`Putting data in remote store fails. Reason: ${e}.`);
    }
  }

  /*
   * Make directory with given path.
   */
  async mkdir(filepath: string): Promise<void> {
    return axios.post(
      `${RemoteStore.STD_ENDPOINT}/2/files/create_folder_v2`,
      {
        path: this.getPath(filepath),
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
   * Delete file/folder with given filename.
   */
  async delete(filename: string): Promise<void> {
    try {
      await axios.post(
        `${RemoteStore.STD_ENDPOINT}/2/files/delete_v2`,
        {
          path: this.getPath(filename),
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
