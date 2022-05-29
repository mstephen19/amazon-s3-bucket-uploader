import Apify from 'apify';
import { DownloadItemsFormat } from 'apify-client';
import type { Input } from '../types';

type GetItemsInput = Pick<Input, 'separateItems'> & { defaultDatasetId: string };

const getItems = async ({ separateItems, defaultDatasetId }: GetItemsInput): Promise<Buffer[]> => {
    try {
        const client = Apify.newClient();

        // Download the items
        const buffer = await client
            .dataset(defaultDatasetId)
            .downloadItems(DownloadItemsFormat.JSON);

        // If they don't want separate items
        // Return an array with the whole dataset buffer
        if (!separateItems) return [buffer];

        // Otherwise, parse the array, map through it, and return a buffer for each item
        const parsed = JSON.parse(buffer.toString('utf-8')) as Record<string, unknown>[];

        return parsed.map((obj) => Buffer.from(JSON.stringify(obj)));
    } catch (error) {
        throw new Error(`Failed when downloading items: ${(error as Error)?.message}`);
    }
};

export default getItems;
