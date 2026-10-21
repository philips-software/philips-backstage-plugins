import { LoggerService } from '@backstage/backend-plugin-api';

export function createMockLogger(): LoggerService {
  const logger: LoggerService = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    child: () => logger,
  };

  return logger;
}
