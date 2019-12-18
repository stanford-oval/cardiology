class Table {
  indexFile: string;

  files: string[];

  constructor(index: string) {
    this.indexFile = index;
    this.files = [];
  }
}
