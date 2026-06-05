import { ConfigModule } from '../../config/config.module';
import { Module } from '../ioc-container/module.decorator';
import { DatabaseService } from './database.service';
import { TransactionManagerService } from './transaction-manager.service';

@Module({
    imports: [ConfigModule],
    providers: [DatabaseService, TransactionManagerService],
    exports: [DatabaseService, TransactionManagerService],
})
export class DatabaseModule {}
