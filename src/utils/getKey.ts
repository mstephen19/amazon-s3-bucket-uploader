import { v4 } from 'uuid';
import path from 'path';

import { Variables } from '../consts';

interface GetKeyInput {
    fileName: string;
    pathName: string;
    actorName: string;
    finishedAt: Date;
    actorRunId: string;
    incrementor: number;
}

/**
 * Generate a "key" based on the fileName and pathName with all variables plugged in
 */
const getKey = ({
    fileName,
    pathName,
    actorName,
    finishedAt,
    actorRunId,
    incrementor,
}: GetKeyInput) => {
    const vars = {
        [Variables.ACTOR_NAME]: actorName,
        [Variables.RUN_ID]: actorRunId,
        [Variables.DATE]: finishedAt.toISOString().split('T')[0],
        [Variables.NOW]: Date.now().toString(),
        [Variables.UUID]: v4(),
        [Variables.INCREMENTOR]: incrementor.toString(),
    };

    const [formattedPath, formattedFile] = [pathName, fileName].map((str) => {
        return Object.entries(vars).reduce((acc, [key, val]) => acc.replace(key, val), str);
    });

    return path.join(formattedPath, `${formattedFile}.json`);
};

export default getKey;
