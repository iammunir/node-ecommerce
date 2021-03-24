import { RequestHandler, Response, Request, NextFunction } from 'express';


export const get404: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).render('404', {
        pageTitle: 'The Store - Page Not Found',
    });
};
