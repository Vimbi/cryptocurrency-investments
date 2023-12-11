export interface IUploadFile {
  name: string;
  buffer: Buffer;
  folder?: string;
  displayName: string;
  extension: string;
}
