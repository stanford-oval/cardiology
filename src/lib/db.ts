export default class Database {
  indexFile: string;

  tables: Table[];

  constructor(index: string) {
    this.indexFile = index;
    this.tables = [];
  }

  /*
   * Load database from index file.
   */
  static async load(index: string): Promise<void> {
    // get list of table indexes in index file.
  }
}
