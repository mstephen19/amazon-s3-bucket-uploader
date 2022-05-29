import Apify from 'apify';

const getRunData = async (runId: string) => {
    try {
        const client = Apify.newClient();

        const run = await client.run(runId).get();
        if (!run) throw new Error('Request for run returned "undefined"');

        const actor = await client.actor(run?.actId).get();
        if (!actor) throw new Error('Request for actor returned "undefined"');

        return {
            name: actor?.name,
            defaultDatasetId: run?.defaultDatasetId,
            finishedAt: run.finishedAt,
        };
    } catch (error) {
        throw new Error(`Failed to grab run and actor info: ${(error as Error)?.message}`);
    }
};

export default getRunData;
