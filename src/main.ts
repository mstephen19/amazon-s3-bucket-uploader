import Apify from 'apify';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import type { Input } from './types';
import { getRunData, getItems, getKey } from './utils';
import { Variables } from './consts';

const { log } = Apify.utils;

Apify.main(async () => {
    const { bucketName, region, accessKeyId, secretAccessKey, actorRunId, pathName, fileName, separateItems } = (await Apify.getInput()) as Input;

    // If the user has chosen to upload separate items but isn't using unique variables in the,
    // fileName, warn them and tell them the consequences.
    if (separateItems && !Object.values(Variables).slice(3).some((str) => fileName.includes(str))) {
        log.warning(`Uploading multiple files, but not using unique variables to generate unique file names! Files will likely be overwritten.
        Use {now}, {incrementor}, or {uuid} to prevent issues.`);
    }

    // Grab general run data
    const { name: actorName, defaultDatasetId, finishedAt } = await getRunData(actorRunId);
    log.info(`Run data for ${actorName}:${actorRunId} retrieved.`);

    // Get an array of buffers. If separateItems is set to false, the array length will be 1
    const buffers = await getItems({ defaultDatasetId, separateItems });
    log.info(`Retrieved items from default dataset ${defaultDatasetId}`);

    // Quit early if there's no data
    if (!buffers.length) return log.warning('Default dataset of the provided run is empty. Uploading nothing.');

    const client = new S3Client({
        credentials: {
            // Trim any potential spaces
            accessKeyId: accessKeyId.trim(),
            secretAccessKey: secretAccessKey.trim(),
        },
        region,
        apiVersion: '2006-03-01',
    });

    const promises = buffers.map((buffer, i) => {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            // Generate a "Key" based on the pathName and fileName,
            // populate the variables now
            Key: getKey({
                fileName,
                pathName,
                actorName,
                finishedAt,
                actorRunId,
                // Start index at 1
                incrementor: i + 1,
            }),
            Body: buffer,
            ContentType: 'application/json',
            ContentLength: buffer.byteLength,
        });

        return (async () => {
            try {
                await client.send(command);
                log.info('Successfully put object.');
            } catch (error) {
                throw new Error(`Failed to put object: ${(error as Error)?.message}`);
            }
        })();
    });

    await Promise.all(promises);
    log.info('Done.');
});
