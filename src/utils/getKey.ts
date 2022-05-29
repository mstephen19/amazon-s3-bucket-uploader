import { v4 } from 'uuid';
import path from 'path';

interface GetKeyInput {
    fileName: string;
    pathName: string;
    actorName: string;
    finishedAt: Date;
    actorRunId: string;
    incrementor: number;
}

const getKey = ({
    fileName,
    pathName,
    actorName,
    finishedAt,
    actorRunId,
    incrementor,
}: GetKeyInput) => {
    const vars = {
        '{actorName}': actorName,
        '{runId}': actorRunId,
        '{date}': finishedAt.toISOString().split('T')[0],
        '{now}': Date.now().toString(),
        '{uuid}': v4(),
        '{incrementor}': incrementor.toString(),
    };

    const [formattedPath, formattedFile] = [pathName, fileName].map((str) => {
        return Object.entries(vars).reduce((acc, [key, val]) => acc.replace(key, val), str);
    });

    return path.join(formattedPath, `${formattedFile}.json`);
};

export default getKey;
