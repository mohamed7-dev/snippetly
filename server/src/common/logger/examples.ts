/**
 * Examples demonstrating how to use the contextual loggers
 *
 * This file shows practical usage patterns for server, database,
 * and performance logging in different scenarios.
 */

import {
  logger,
  serverLogger,
  databaseLogger,
  performanceLogger,
  PerformanceLogger,
  DatabaseLogger,
  ServerLogger,
  ErrorLogger,
  createExecutionTimer,
  timed
} from './index';

// ================================
// SERVER LOGGING EXAMPLES
// ================================

/**
 * Example: Express middleware logging
 */
export function exampleMiddlewareLogging() {
  // Basic server events
  serverLogger.info('Server starting up...');
  serverLogger.info('Routes configured successfully');

  // Request logging with metadata
  serverLogger.info('Incoming request', {
    endpoint: '/api/users',
    method: 'GET',
    userAgent: 'Mozilla/5.0...',
    ip: '192.168.1.1'
  });

  // Authentication events
  ServerLogger.logAuth('login', 'user123', '192.168.1.1', 'Chrome/91.0');
  ServerLogger.logAuth('failed_login', 'user456', '192.168.1.100');

  // Security events
  ServerLogger.logSecurity('rate_limit', 'Too many requests from IP', '192.168.1.200', {
    endpoint: '/api/login',
    method: 'POST'
  });
}

/**
 * Example: API endpoint with server logging
 */
export async function exampleApiEndpoint(req: any, res: any) {
  const timer = createExecutionTimer('User Registration API', 'server');

  try {
    serverLogger.info(`Processing registration request`, {
      endpoint: req.path,
      method: req.method,
      ip: req.ip
    });

    // Simulate some processing
    await new Promise(resolve => setTimeout(resolve, 150));

    serverLogger.info('User registered successfully', {
      endpoint: req.path,
      statusCode: 201
    });

    timer.end('User created');

  } catch (error) {
    ErrorLogger.logUnhandledError(error as Error, 'User Registration API', {
      endpoint: req.path,
      method: req.method
    });
    timer.end('Error occurred');
  }
}

// ================================
// DATABASE LOGGING EXAMPLES
// ================================

/**
 * Example: Database operations
 */
export async function exampleDatabaseOperations() {
  // Connection events
  DatabaseLogger.logConnection('connect', 'PostgreSQL on localhost:5432');

  // Query operations with performance tracking
  const queryTimer = createExecutionTimer('User Query', 'database');

  try {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 45));

    DatabaseLogger.logOperation('SELECT', 'users', 'fetching user profile', {
      query: 'SELECT * FROM users WHERE id = $1',
      queryTime: 45,
      affectedRows: 1
    });

    queryTimer.end('Query successful');

  } catch (error) {
    databaseLogger.error('Query failed', {
      query: 'SELECT * FROM users WHERE id = $1',
      error: (error as Error).message
    });
    queryTimer.end('Query failed');
  }

  // Transaction logging
  DatabaseLogger.logTransaction('start', 'txn_001');
  DatabaseLogger.logOperation('INSERT', 'orders', 'creating new order');
  DatabaseLogger.logOperation('UPDATE', 'inventory', 'updating stock levels');
  DatabaseLogger.logTransaction('commit', 'txn_001');

  // Migration logging
  DatabaseLogger.logMigration('start', '001_create_users_table');
  DatabaseLogger.logMigration('complete', '001_create_users_table', 'Added 5 columns');
}

/**
 * Example: Database service class with logging
 */
export class UserService {
  @timed('database')
  async findUser(id: string) {
    databaseLogger.info(`Finding user with ID: ${id}`);

    try {
      // Simulate database query
      await new Promise(resolve => setTimeout(resolve, 30));

      DatabaseLogger.logOperation('SELECT', 'users', `found user ${id}`, {
        query: 'SELECT * FROM users WHERE id = $1',
        queryTime: 30,
        affectedRows: 1
      });

      return { id, name: 'John Doe' };
    } catch (error) {
      databaseLogger.error(`Failed to find user ${id}`, {
        error: (error as Error).message,
        query: 'SELECT * FROM users WHERE id = $1'
      });
      throw error;
    }
  }

  @timed('database')
  async createUser(userData: any) {
    const transactionId = `txn_${Date.now()}`;

    DatabaseLogger.logTransaction('start', transactionId);

    try {
      // Simulate user creation
      await new Promise(resolve => setTimeout(resolve, 120));

      DatabaseLogger.logOperation('INSERT', 'users', 'new user created', {
        query: 'INSERT INTO users (name, email) VALUES ($1, $2)',
        queryTime: 120,
        affectedRows: 1
      });

      DatabaseLogger.logTransaction('commit', transactionId);

      return { id: 'new_user_id', ...userData };
    } catch (error) {
      DatabaseLogger.logTransaction('rollback', transactionId, (error as Error).message);
      throw error;
    }
  }
}

// ================================
// PERFORMANCE LOGGING EXAMPLES
// ================================

/**
 * Example: API performance monitoring
 */
export async function examplePerformanceMonitoring() {
  // Manual performance timing
  const apiTimer = PerformanceLogger.timer('API Processing');

  // Simulate API processing
  await new Promise(resolve => setTimeout(resolve, 250));

  apiTimer.end({
    endpoint: '/api/reports',
    statusCode: 200
  });

  // Automatic API request logging
  PerformanceLogger.logApiRequest('/api/users', 'GET', 150, 200, {
    operation: 'List Users'
  });

  PerformanceLogger.logApiRequest('/api/upload', 'POST', 1500, 200, {
    operation: 'File Upload'
  }); // This will log as warning due to slow response

  // Database query performance
  PerformanceLogger.logQueryPerformance(
    'SELECT * FROM orders WHERE created_at > $1',
    850,
    150
  );
}

/**
 * Example: Performance monitoring service
 */
export class PerformanceMonitoringService {
  @timed('performance')
  async processLargeDataset(data: any[]) {
    performanceLogger.info(`Processing dataset with ${data.length} items`);

    const batchTimer = PerformanceLogger.timer('Batch Processing');

    try {
      // Simulate processing
      for (let i = 0; i < data.length; i += 100) {
        await new Promise(resolve => setTimeout(resolve, 50));

        if (i % 500 === 0) {
          performanceLogger.debug(`Processed ${i} items`);
        }
      }

      batchTimer.end({
        operation: 'Dataset Processing',
        statusCode: 200
      });

    } catch (error) {
      performanceLogger.error('Dataset processing failed', {
        error: (error as Error).message,
        processedItems: data.length
      });
      throw error;
    }
  }

  async monitorMemoryUsage() {
    const memUsage = process.memoryUsage();
    const memInMB = Math.round(memUsage.heapUsed / 1024 / 1024);

    if (memInMB > 100) {
      performanceLogger.warn(`High memory usage detected: ${memInMB}MB`, {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      });
    } else {
      performanceLogger.debug(`Memory usage: ${memInMB}MB`, {
        heapUsed: memUsage.heapUsed
      });
    }
  }
}

// ================================
// MIXED CONTEXT EXAMPLES
// ================================

/**
 * Example: E-commerce order processing with multiple contexts
 */
export class OrderProcessingService {
  @timed('server')
  async processOrder(orderData: any) {
    const orderId = `order_${Date.now()}`;

    // Server context: API request received
    serverLogger.info(`Processing order request`, {
      endpoint: '/api/orders',
      method: 'POST'
    });

    try {
      // Database context: Start transaction
      const transactionId = `txn_${Date.now()}`;
      DatabaseLogger.logTransaction('start', transactionId);

      // Database context: Create order
      const dbTimer = createExecutionTimer('Create Order Record', 'database');
      await new Promise(resolve => setTimeout(resolve, 80));

      DatabaseLogger.logOperation('INSERT', 'orders', `created order ${orderId}`, {
        query: 'INSERT INTO orders (...) VALUES (...)',
        queryTime: 80,
        affectedRows: 1
      });
      dbTimer.end();

      // Database context: Update inventory
      const inventoryTimer = createExecutionTimer('Update Inventory', 'database');
      await new Promise(resolve => setTimeout(resolve, 45));

      DatabaseLogger.logOperation('UPDATE', 'inventory', 'updated stock levels', {
        query: 'UPDATE inventory SET quantity = quantity - $1',
        queryTime: 45,
        affectedRows: 3
      });
      inventoryTimer.end();

      // Performance context: External payment processing
      const paymentTimer = PerformanceLogger.timer('Payment Processing');
      await new Promise(resolve => setTimeout(resolve, 200));
      paymentTimer.end({
        operation: 'Credit Card Processing',
        statusCode: 200
      });

      // Database context: Commit transaction
      DatabaseLogger.logTransaction('commit', transactionId);

      // Server context: Success response
      serverLogger.info(`Order processed successfully`, {
        endpoint: '/api/orders',
        statusCode: 201
      });

      return { orderId, status: 'processed' };

    } catch (error) {
      // Error logging with appropriate context
      ErrorLogger.logUnhandledError(error as Error, 'Order Processing Service', {
        orderId,
        orderData
      });

      // Server context: Error response
      serverLogger.error(`Order processing failed`, {
        endpoint: '/api/orders',
        statusCode: 500
      });

      throw error;
    }
  }
}

// ================================
// VALIDATION AND ERROR EXAMPLES
// ================================

/**
 * Example: Input validation with logging
 */
export function exampleValidationLogging(userData: any, endpoint: string) {
  if (!userData.email) {
    ErrorLogger.logValidationError('email', userData.email, 'required', endpoint);
    throw new Error('Email is required');
  }

  if (!userData.email.includes('@')) {
    ErrorLogger.logValidationError('email', userData.email, 'format', endpoint, {
      method: 'POST'
    });
    throw new Error('Invalid email format');
  }

  serverLogger.info('User data validation passed', {
    endpoint,
    fields: Object.keys(userData)
  });
}

// ================================
// STARTUP AND SHUTDOWN EXAMPLES
// ================================

/**
 * Example: Application lifecycle logging
 */
export class ApplicationLifecycle {
  static startup() {
    ServerLogger.logStartup(3000, process.env.NODE_ENV || 'development');

    // Database startup
    DatabaseLogger.logConnection('connect', 'PostgreSQL connection established');

    // Performance baseline
    performanceLogger.info('Application baseline metrics', {
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    });
  }

  static shutdown(signal?: string) {
    ServerLogger.logShutdown(signal ? `Received ${signal}` : undefined);

    // Database cleanup
    DatabaseLogger.logConnection('disconnect', 'Closing database connections');

    // Performance summary
    performanceLogger.info('Application shutdown metrics', {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    });
  }
}

// Example usage in your main application file:
/*
// In your main server file (app.ts or index.ts):

import { ApplicationLifecycle } from './common/logger/examples';

// On startup
ApplicationLifecycle.startup();

// On shutdown
process.on('SIGTERM', () => ApplicationLifecycle.shutdown('SIGTERM'));
process.on('SIGINT', () => ApplicationLifecycle.shutdown('SIGINT'));

*/
