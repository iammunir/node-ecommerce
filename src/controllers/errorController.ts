import { RequestHandler, Response, Request, NextFunction } from 'express';


export const get404: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).render('error/404', {
        pageTitle: 'The Store - Page Not Found',
        path: '/404'
    });
};

export const get500: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(500).render('error/500', {
        pageTitle: 'The Store - Internal Error',
        path: '/500'
    });
};