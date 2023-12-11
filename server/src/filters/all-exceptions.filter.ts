import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const req = ctx.getRequest();
    const { method, protocol, originalUrl: url } = req;
    const query = JSON.stringify(req.query);
    let stringifyBody = '';
    if (req.body) {
      const body = { ...req.body };
      if (body.password) body.password = '******';
      if (body.oldPassword) body.oldPassword = '******';
      if (body.newPassword) body.newPassword = '******';
      stringifyBody = JSON.stringify(body);
    }
    let status: number;
    let message = '';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      exception = exception.getResponse();
      if (typeof exception === 'string') {
        message = exception;
      } else if (exception.message) {
        message = exception.message;
      } else {
        message = exception;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
    }
    this.logger.error(
      `${protocol} | ${status} | [${method}] | ${req.ip} | ${url}
          query={${query}}
          body={${stringifyBody}}
          message={${JSON.stringify(message)}}`,
    );
    res.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toLocaleString('en-GB', {
        timeZone: 'Europe/London',
        hour12: false,
      }),
      path: req.url,
    });

    if (exception instanceof Error && !(exception instanceof HttpException)) {
      this.logger.error(`message: ${exception.message}
      stack trace: ${exception.stack}`);
    }
  }
}
