import { Request, Response, NextFunction } from 'express';

const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
};

module.exports = errorHandlerMiddleware;



// import { Request, Response, NextFunction } from 'express';

// const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
//   console.error(err);
//   res.status(500).json({ message: 'Something went wrong, please try again later.' });
// };

// export default errorHandlerMiddleware;
