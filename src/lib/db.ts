import RemoteStore from './remoteStore';
import Table from './table';

export default class Database {
  store: RemoteStore;

  tables: Table[];

  version: string | null;

  constructor(directory: string, storeKey: string) {
    this.tables = [];

    const store = new RemoteStore(storeKey);
    store.cd(directory);
    this.store = store;

    this.version = null;
  }

  /*
   * Load database from index file in remote store.
   */
  async load(): Promise<void> {
    try {
      // download index file
      const index = await this.store.get('index.json');

      // load tables
      this.tables = index.tables.map(async (t: any) => {
        const table = await Table.load(t.directory, this.store);
        return table;
      });
    } catch (e) {
      throw Error(`Failed to load database. Reason: "${e}"`);
    }
  }
}
