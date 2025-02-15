# Strapi Google Cloud Storage Provider

A Google Cloud Storage provider for Strapi v5 upload.

## Installation

```bash
yarn add @3akram/strapi-provider-upload-google-cloud-storage
```

## Configuration

### Provider Configuration

`./config/plugins.ts`
```typescript
export default ({ env }) => ({
  upload: {
    config: {
      provider: '@3akram/strapi-provider-upload-google-cloud-storage',
      providerOptions: {
        bucketName: env('GOOGLE_CLOUD_BUCKET'),
        publicFiles: true,
        uniform: true,
        basePath: '',
        baseUrl: 'https://custom-url.com' // Optional base url. Replaces https://storage.googleapis.com/{bucketName}
      },
    },
  },
});
```

### Required Environment Variables

```env
GOOGLE_CLOUD_BUCKET=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Google Cloud Setup

1. Create a Google Cloud Storage bucket
2. Enable uniform bucket-level access
3. Make the bucket publicly accessible by adding the following IAM policy:
   - Member: `allUsers`
   - Role: `Storage Object Viewer`
4. Create a service account with the following roles:
   - `Storage Object Creator`
   - `Storage Object Viewer`
   - `Storage Object Admin` (if you want to enable file deletion)
5. Download the service account key JSON file and set its path in `GOOGLE_APPLICATION_CREDENTIALS`

## Features

- Upload files to Google Cloud Storage
- Delete files from Google Cloud Storage
- Support for uniform bucket-level access
- Detailed logging for debugging
- TypeScript support

## Development

```bash
# Install dependencies
yarn install

# Build the provider
yarn build

# Run tests (when implemented)
yarn test
```

## License

MIT
