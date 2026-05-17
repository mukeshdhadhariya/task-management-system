declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';

  const swaggerUi: {
    serve: RequestHandler | RequestHandler[];
    setup: (swaggerDoc?: any, opts?: any) => RequestHandler;
  };

  export default swaggerUi;
}
