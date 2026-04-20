import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
  getHello(res:Response) {
   const htmlFilePath = join(process.cwd(),'src','utlils','template','home-template.html');
   const html = readFileSync(htmlFilePath,'utf-8');
    res.setHeader('Content-Type', 'text/html');
    return res.status(HttpStatus.OK).send(html);
  }
}
