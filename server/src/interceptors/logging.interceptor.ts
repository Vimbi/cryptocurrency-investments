import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const { method, protocol } = req;
    const url = req.originalUrl;
    const query = JSON.stringify(req.query);

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        let stringifyBody = '';
        if (req.body) {
          const body = { ...req.body };
          if (body.password) body.password = '******';
          if (body.oldPassword) body.oldPassword = '******';
          if (body.newPassword) body.newPassword = '******';
          stringifyBody = JSON.stringify(body);
        }
        const status = res.statusCode;
        const delay = Date.now() - now;
        this.logger.log(
          `${protocol} | ${status} | [${method}] | ${req.ip} | ${url} - ${delay}ms
          query={${query}}
          body={${stringifyBody}}`,
        );
      }),
    );
  }
}
