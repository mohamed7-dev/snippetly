import { appConfig } from './app-config.js';
import { bootstrap } from './bootstrap.js';

const application = await bootstrap(appConfig, { listen: false });

export default application.expressApp;
