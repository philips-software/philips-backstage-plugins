require('jest-fetch-mock').enableMocks();
// eslint-disable-next-line no-restricted-imports
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
