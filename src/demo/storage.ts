/**
 * Offline stand-in for firebase.storage().
 *
 * Uploads stay in the tab: the file is held in memory and served through an
 * object URL, so image/file previews in the chat work exactly as they would
 * against real Storage. URLs die with the page, which is fine for a demo.
 */

class DemoStorageReference {
  constructor(private readonly bucket: Map<string, string>, readonly fullPath: string) {}

  async put(file: Blob, _metadata?: unknown): Promise<{ ref: DemoStorageReference }> {
    const previous = this.bucket.get(this.fullPath);
    if (previous) URL.revokeObjectURL(previous);

    this.bucket.set(this.fullPath, URL.createObjectURL(file));
    return { ref: this };
  }

  async getDownloadURL(): Promise<string> {
    const url = this.bucket.get(this.fullPath);
    if (!url) throw new Error(`No demo upload stored at ${this.fullPath}`);
    return url;
  }

  async delete(): Promise<void> {
    const url = this.bucket.get(this.fullPath);
    if (url) URL.revokeObjectURL(url);
    this.bucket.delete(this.fullPath);
  }

  child(path: string): DemoStorageReference {
    return new DemoStorageReference(this.bucket, `${this.fullPath}/${path}`);
  }
}

export class DemoStorage {
  private bucket = new Map<string, string>();

  ref(path = ''): DemoStorageReference {
    return new DemoStorageReference(this.bucket, path);
  }

  refFromURL(url: string): DemoStorageReference {
    return new DemoStorageReference(this.bucket, url);
  }
}
