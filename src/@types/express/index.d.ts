import { User } from '../../models/user';

declare global {
    namespace Express {
        interface Request {
            currentUser?: User,
            isLoggedIn: boolean,
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        user: User,
        isLoggedIn: boolean,
    }
  }