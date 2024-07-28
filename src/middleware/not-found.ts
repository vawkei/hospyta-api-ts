import { Request, Response, NextFunction } from 'express';

const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).send('Route does not exist');
};

module.exports =  notFoundMiddleware;


// mport { Request, Response, NextFunction } from 'express';

// const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   res.status(404).send('Route does not exist');
// };

// export default notFoundMiddleware;
