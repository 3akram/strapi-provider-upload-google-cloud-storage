import { Storage } from '@google-cloud/storage';
import type { ProviderOptions, File } from './types';
import { logger, validateConfig } from './utils';

export = {
    init(config: ProviderOptions) {
        // Validate the configuration
        validateConfig(config);
        logger.info('Initializing GCS provider with config:', config);

        // Initialize Google Cloud Storage
        const storage = new Storage();
        const bucket = storage.bucket(config.bucketName);
        logger.info(`Connected to bucket: ${config.bucketName}`);

        // Helper function to construct file path
        const getFilePath = (filename: string): string => {
            const basePath = config.basePath?.replace(/^\/+|\/+$/g, '') || '';
            return basePath ? `${basePath}/${filename}` : filename;
        };

        // Helper function to create the public url
        const getPublicUrl = (filepath: string) => {
            const {bucketName, baseUrl} = config;
            const base = baseUrl ?? `https://storage.googleapis.com/${bucketName}`;
            return `${base}/${filepath}`;
        }

        return {
            async upload(file: File) {
                try {
                    logger.info('Starting upload for file:', {
                        name: file.name,
                        hash: file.hash,
                        ext: file.ext,
                        mime: file.mime,
                        size: file.size,
                    });

                    // Create a unique filename and path
                    const filename = `${file.hash}${file.ext}`;
                    const filepath = getFilePath(filename);
                    logger.info(`Generated filepath: ${filepath}`);

                    // Create a new blob in the bucket
                    const blob = bucket.file(filepath);
                    logger.info('Created blob reference');

                    // Prepare upload options
                    const uploadOptions: any = {
                        resumable: false,
                        metadata: {
                            contentType: file.mime,
                        },
                    };

                    // Add predefined ACL if uniform access is not enabled
                    if (!config.uniform && config.publicFiles) {
                        uploadOptions.predefinedAcl = 'publicRead';
                    }

                    // Upload the file data
                    const blobStream = blob.createWriteStream(uploadOptions);
                    logger.info('Created write stream with options:', uploadOptions);

                    // Handle errors during upload
                    return new Promise((resolve, reject) => {
                        blobStream.on('error', error => {
                            logger.error(`Error uploading file ${filepath}:`, error);
                            reject(error);
                        });

                        blobStream.on('finish', async () => {
                            try {
                                // Check if the file exists in the bucket
                                const [exists] = await blob.exists();
                                logger.info(`File exists in bucket: ${exists}`);

                                if (!exists) {
                                    throw new Error('File was not uploaded successfully');
                                }

                                // Make the file public if needed and uniform access is not enabled
                                if (!config.uniform && config.publicFiles) {
                                    await blob.makePublic();
                                    logger.info('File made public');
                                }

                                // Construct the public URL
                                const publicUrl = getPublicUrl(filepath);
                                logger.info(`Upload finished. Public URL: ${publicUrl}`);

                                const result = {
                                    ...file,
                                    url: publicUrl,
                                };
                                file.url = publicUrl;
                                logger.info('Returning result:', result);
                                resolve(result);
                            } catch (error) {
                                logger.error('Error in finish handler:', error);
                                reject(error);
                            }
                        });

                        logger.info('Writing file buffer to stream...');
                        if (!file.buffer) {
                            logger.error('File buffer is undefined or null');
                            reject(new Error('File buffer is missing'));
                            return;
                        }
                        blobStream.end(file.buffer);
                    });
                } catch (error) {
                    logger.error('Error in upload:', error);
                    throw error;
                }
            },

            async delete(file: File) {
                try {
                    if (!file.url) {
                        return;
                    }

                    // Extract filename from the URL
                    const urlParts = file.url.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    if (!filename) {
                        throw new Error('Could not extract filename from URL');
                    }

                    // Get the full filepath
                    const filepath = getFilePath(filename);
                    logger.info(`Deleting file: ${filepath}`);

                    // Delete the file
                    await bucket.file(filepath).delete();
                    logger.info('File deleted successfully');
                } catch (error) {
                    logger.error('Error in delete:', error);
                    throw error;
                }
            },
        };
    },
};
