

// types/custom.d.ts
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    files?: {
      image?: {
        size: number;
        tempFilePath: string;
      };
    };
  }
}

