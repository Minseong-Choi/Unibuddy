import { Request as ExRequest } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
  }
}