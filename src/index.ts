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

                    // Create a unique filename
                    const filename = `${file.hash}${file.ext}`;
                    logger.info(`Generated filename: ${filename}`);

                    // Create a new blob in the bucket
                    const blob = bucket.file(filename);
                    logger.info('Created blob reference');

                    // Upload the file data
                    const blobStream = blob.createWriteStream({
                        resumable: false,
                        metadata: {
                            contentType: file.mime,
                        },
                    });
                    logger.info('Created write stream with metadata:', { contentType: file.mime });

                    // Handle errors during upload
                    return new Promise((resolve, reject) => {
                        blobStream.on('error', error => {
                            logger.error(`Error uploading file ${filename}:`, error);
                            reject(error);
                        });

                        blobStream.on('finish', async () => {
                            try {
                                // Construct the public URL
                                const publicUrl = `https://storage.googleapis.com/${config.bucketName}/${filename}`;
                                logger.info(`Upload finished. Public URL: ${publicUrl}`);

                                // Check if the file exists in the bucket
                                const [exists] = await blob.exists();
                                logger.info(`File exists in bucket: ${exists}`);

                                if (!exists) {
                                    throw new Error('File was not uploaded successfully');
                                }

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
                    const filename = file.url.split('/').pop();
                    if (!filename) {
                        throw new Error('Could not extract filename from URL');
                    }

                    logger.info(`Attempting to delete file: ${filename}`);
                    // Delete the file from GCS
                    await bucket.file(filename).delete();
                    logger.info(`File ${filename} deleted successfully`);
                } catch (error) {
                    logger.error('Error in delete:', error);
                    throw error;
                }
            },
        };
    },
};
