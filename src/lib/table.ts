import path from 'path';
import RemoteStore from './remoteStore';

export default class Table {
  name: string;

  directory: string;

  files: string[];

  store: RemoteStore;

  constructor(name: string, directory: string, store: RemoteStore) {
    this.name = name;
    this.directory = directory;
    this.files = [];
    this.store = store;
  }

  getPath(relPath: string) {
    return path.resolve(this.directory, relPath);
  }

  static async load(directory: string, store: RemoteStore): Promise<Table> {
    try {
      const index = await store.get(path.join(directory, 'index.json'));
      const table = new Table(index.name, directory, store);
      return table;
    } catch (e) {
      throw Error(`Failed to load table. Reason: "${e}"`);
    }
  }
}
