import Apify from 'apify';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import type { Input } from './types';
import { getRunData, getItems, getKey } from './utils';

const { log } = Apify.utils;

Apify.main(async () => {
    const {
        bucketName,
        region,
        accessKeyId,
        secretAccessKey,
        actorRunId,
        pathName,
        fileName,
        separateItems,
    } = (await Apify.getInput()) as Input;

    const { name: actorName, defaultDatasetId, finishedAt } = await getRunData(actorRunId);
    log.info(`Run data for ${actorName}:${actorRunId} retrieved.`);

    const buffers = await getItems({ defaultDatasetId, separateItems });
    log.info(`Retrieved items from default dataset ${defaultDatasetId}`);

    const client = new S3Client({
        credentials: {
            accessKeyId: accessKeyId.trim(),
            secretAccessKey: secretAccessKey.trim(),
        },
        region,
        apiVersion: '2006-03-01',
    });

    const promises = buffers.map((buffer, i) => {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: getKey({
                fileName,
                pathName,
                actorName,
                finishedAt,
                actorRunId,
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
                log.warning(`Failed to put object: ${(error as Error)?.message}`);
            }
        })();
    });

    await Promise.all(promises);
    log.info('Done.');
});
