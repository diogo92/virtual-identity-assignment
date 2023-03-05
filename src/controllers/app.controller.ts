import { Request, Response } from 'express';
import { AppService } from '../services/app.service';
import { UserService } from '../services/user.service';

/**
 * A controller that handles URL shortening and redirection.
 */
export class AppController {

    /**
     * Asynchronously shortens a URL provided in the request body and returns a
     * response with the shortened URL and other details. If there is an error,
     * a 500 status code is returned with an error message.
     * 
     * @param {Request} req - The Express request object containing the URL to be shortened.
     * @param {Response} res - The Express response object to be returned with the shortened URL.
     */
    public static async getShortenedUrl(req: Request, res: Response) {
        let loggedIn = false;
        if (req.session.user)
            loggedIn = true;
        try {
            const iURL = await AppService.shortenUrl(req.body.url, req.session.user);
            res.status(201).render('index', {
                shortenedUrl: iURL.shortenedUrl,
                timesShortened: iURL.timesShortened,
                timesAccessed: iURL.timesAccessed,
                loggedIn: loggedIn
            });
        } catch (err) {
            console.error(err);
            return res.status(500).render('index', { error: 'Invalid URL', loggedIn: loggedIn });
        }
    }

    /**
     * Asynchronously redirects to the original URL associated with a given
     * shortened URL parameter. If the shortened URL does not exist, a 400 status
     * code is returned with an error message.
     * 
     * @param {Request} req - The Express request object containing the shortened URL parameter.
     * @param {Response} res - The Express response object to be returned with the redirect.
     */
    public static async redirectToUrl(req: Request, res: Response) {
        if (req.params.shortenedUrl && req.params.shortenedUrl !== "") {
            const shortenedUrl = `${process.env.HOST}:${process.env.PORT}/${req.params.shortenedUrl}`;
            const url = await AppService.getUrlFromShortenedUrl(shortenedUrl);
            if (url) {
                return res.status(301).redirect(`http://${url}`);
            } else {
                let loggedIn = false;
                if (req.session.user)
                    loggedIn = true;
                return res.status(400).render('index', { error: `Shortened url ${shortenedUrl} does not exists`, loggedIn: loggedIn });
            }
        }
    }

    /**
     * Asynchronously logs in a user with the given email and password credentials.
     * If the login is successful, a session is created for the user and a 200 status
     * code is returned with a response indicating the user is logged in. If the login
     * fails, a 400 status code is returned with an error message.
     * 
     * @param {Request} req - The Express request object containing the user's login credentials.
     * @param {Response} res - The Express response object to be returned with the login status.
     */
    public static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const user = await UserService.login(email, password);
            if (user) {
                req.session.user = user;
                req.session.save(() => {
                    return res.status(200).render('index', { loggedIn: true });
                })
            } else {
                return res.status(400).render('login', { error: 'Invalid username or password' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).render('login', { error: 'Internal server error' });
        }
    }


    /**
     * Asynchronously logs out a user by destroying the current session.
     * A 200 status code is returned with a response indicating the user is logged out.
     * 
     * @param {Request} req - The Express request object for logging out the user.
     * @param {Response} res - The Express response object to be returned with the logout status.
     */
    public static async logout(req: Request, res: Response) {
        req.session.user = null;
        req.session.save(() => {
            req.session.regenerate(() => {
                return res.status(200).render('index', { loggedIn: false });
            })
        })
    }
}