import 'reflect-metadata'; // for some reason scripts at repo needs this
export * from './api/index';
export { App } from './app';
export { AppModule } from './app.module';
export { bootstrap, runPreConfig } from './bootstrap';
export * from './common/index';
export * from './config/index';
export * from './entities/index';
export * from './infra/index';
export * from './services/index';
