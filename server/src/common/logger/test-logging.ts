/**
 * Test file to demonstrate context-specific logging
 * Run this to see how logs are filtered into different files
 */

import {
  logger,
  serverLogger,
  databaseLogger,
  performanceLogger,
  ServerLogger,
  DatabaseLogger,
  PerformanceLogger,
} from './index';

export async function testContextualLogging() {
  console.log('\n🧪 Testing Contextual Logging System...\n');

  // Test default logger (no context) - should only go to all.log and console
  logger.info('This is a default log message (no context)');
  logger.warn('This is a warning from default logger');
  logger.error('This is an error from default logger');

  console.log('✅ Default logger messages sent\n');

  // Test SERVER context - should go to server.log, all.log, and console
  serverLogger.info('Server started successfully', {
    port: 3000,
    environment: 'development'
  });

  serverLogger.warn('High memory usage detected', {
    memoryUsage: '85%',
    threshold: '80%'
  });

  serverLogger.error('Authentication failed', {
    endpoint: '/api/auth/login',
    ip: '192.168.1.100',
    reason: 'Invalid credentials'
  });

  // Using ServerLogger utility
  ServerLogger.logAuth('login', 'user123', '192.168.1.1', 'Chrome/91.0');
  ServerLogger.logSecurity('rate_limit', 'Too many requests', '192.168.1.200');

  console.log('✅ Server context messages sent\n');

  // Test DATABASE context - should go to database.log, all.log, and console
  databaseLogger.info('Database connection established', {
    host: 'localhost',
    database: 'sms_db',
    connectionTime: '45ms'
  });

  databaseLogger.warn('Slow query detected', {
    query: 'SELECT * FROM users WHERE created_at > ?',
    executionTime: '1200ms',
    threshold: '1000ms'
  });

  databaseLogger.error('Query execution failed', {
    query: 'UPDATE users SET status = ? WHERE id = ?',
    error: 'Connection timeout',
    retryAttempt: 3
  });

  // Using DatabaseLogger utility
  DatabaseLogger.logConnection('connect', 'PostgreSQL on localhost:5432');
  DatabaseLogger.logOperation('SELECT', 'users', 'fetching user profiles', {
    queryTime: 85,
    affectedRows: 15
  });
  DatabaseLogger.logTransaction('start', 'txn_001');
  DatabaseLogger.logTransaction('commit', 'txn_001');

  console.log('✅ Database context messages sent\n');

  // Test PERFORMANCE context - should go to performance.log, all.log, and console
  performanceLogger.info('API endpoint performance measured', {
    endpoint: '/api/users',
    method: 'GET',
    responseTime: '150ms',
    statusCode: 200
  });

  performanceLogger.warn('Slow API response detected', {
    endpoint: '/api/reports',
    method: 'POST',
    responseTime: '1500ms',
    threshold: '1000ms'
  });

  performanceLogger.error('Performance threshold exceeded', {
    operation: 'Data export',
    executionTime: '5000ms',
    maxAllowed: '3000ms'
  });

  // Using PerformanceLogger utility
  PerformanceLogger.logApiRequest('/api/users', 'GET', 200, 200);
  PerformanceLogger.logApiRequest('/api/upload', 'POST', 1800, 200); // Will log as warning
  PerformanceLogger.logQueryPerformance(
    'SELECT * FROM orders WHERE created_at > ?',
    950,
    125
  );

  const timer = PerformanceLogger.timer('Test Operation');
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
  timer.end({ operation: 'Test timing utility' });

  console.log('✅ Performance context messages sent\n');

  // Test mixed context scenario
  console.log('🔄 Testing mixed context scenario (API request processing)...\n');

  // Simulate an API request that involves all contexts
  const requestId = `req_${Date.now()}`;

  // Server: Request received
  serverLogger.info('Incoming API request', {
    requestId,
    endpoint: '/api/orders',
    method: 'POST',
    userAgent: 'Test Client'
  });

  // Database: Query execution
  databaseLogger.info('Executing database query', {
    requestId,
    query: 'INSERT INTO orders (user_id, amount) VALUES (?, ?)',
    queryTime: 75
  });

  // Performance: Operation timing
  performanceLogger.info('Request processing completed', {
    requestId,
    totalTime: 225,
    dbTime: 75,
    processingTime: 150
  });

  // Server: Response sent
  serverLogger.info('API response sent', {
    requestId,
    statusCode: 201,
    responseTime: '225ms'
  });

  console.log('✅ Mixed context scenario completed\n');

  console.log('📁 Check the following log files to see context filtering:');
  console.log('   - logs/all.log          (all messages)');
  console.log('   - logs/error.log        (error level only)');
  console.log('   - logs/server.log       (SERVER context only)');
  console.log('   - logs/database.log     (DATABASE context only)');
  console.log('   - logs/performance.log  (PERFORMANCE context only)');
  console.log('\n🎯 Context filtering test completed!\n');
}

// Function to test timing utilities
export async function testTimingUtilities() {
  console.log('\n⏱️  Testing Timing Utilities...\n');

  // Test manual timing
  const timer1 = PerformanceLogger.timer('Manual Operation Test');
  await new Promise(resolve => setTimeout(resolve, 150));
  timer1.end({ details: 'Simulated 150ms operation' });

  // Test with different contexts
  const serverTimer = performanceLogger.info('Starting server operation', { operation: 'user-validation' });
  await new Promise(resolve => setTimeout(resolve, 100));
  performanceLogger.info('Server operation completed', { operation: 'user-validation', duration: '100ms' });

  const dbTimer = databaseLogger.info('Starting database operation', { operation: 'user-lookup' });
  await new Promise(resolve => setTimeout(resolve, 80));
  databaseLogger.info('Database operation completed', { operation: 'user-lookup', duration: '80ms' });

  console.log('✅ Timing utilities test completed\n');
}

// Example usage
if (require.main === module) {
  (async () => {
    await testContextualLogging();
    await testTimingUtilities();
  })();
}
