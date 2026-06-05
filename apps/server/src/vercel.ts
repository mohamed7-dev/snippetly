import { App } from './app';
import { AppModule } from './app.module';

// Create the app without calling listen().
const application = new App(AppModule);

export default application.expressApp;
