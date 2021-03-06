import { LogLevels } from '@elunic/logger';
import { MockLogService } from '@elunic/logger/mocks';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { LOGGER } from '..';
import { loggerNamespaces } from '../inject-logger.decorator';

@Global()
@Module({})
export class MockNestjsLoggerModule {
  static forRoot(
    rootNamespace: string,
    debugLevel: LogLevels | 'silent' = 'silent',
  ): DynamicModule {
    const providers: Provider[] = [
      {
        provide: LOGGER,
        useFactory: () => new MockLogService(rootNamespace, debugLevel),
      },
    ];

    for (const [childNamespace, [injectionToken /* , rawChildOptions*/]] of Array.from(
      loggerNamespaces,
    )) {
      providers.push({
        provide: injectionToken,
        useFactory: () => {
          if (typeof childNamespace === 'string') {
            return new MockLogService(`${rootNamespace}:${childNamespace}`, debugLevel);
          } else {
            // Currently, the only symbol identifies the root logger. [wh]
            return new MockLogService(rootNamespace);
          }
        },
      });
    }

    return {
      module: MockNestjsLoggerModule,
      providers,
      exports: providers,
    };
  }
}
