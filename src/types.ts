export interface ProviderOptions {
  bucketName: string;
  publicFiles?: boolean;
  uniform?: boolean;
  basePath?: string;
}

export interface File {
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, any>;
  hash: string;
  ext?: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  path?: string;
  provider?: string;
  provider_metadata?: Record<string, any>;
  stream?: NodeJS.ReadableStream;
  buffer?: Buffer;
}
