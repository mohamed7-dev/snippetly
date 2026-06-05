import baseMorgan, { type StreamOptions } from 'morgan';
import { Logger } from '../../infra/logger/logger';

const stream: StreamOptions = {
    write: (message: string) => Logger.info(message.substring(0, message.lastIndexOf('\n'))),
};

export const morgan = baseMorgan('dev', { stream });
