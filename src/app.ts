import * as express from 'express';
import { json } from 'body-parser';
import { AppRouter } from './routes/app.route';
import { handleErrors } from './handlers/app.handler';
import { connectDatabase } from './database';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import { IUser } from './models/app.model';

declare module 'express-session' {
    export interface SessionData {
        user: IUser | null;
    }
}

//import * as ejs from 'ejs';
const app: express.Application = express();
const port = process.env.PORT || 3000;

dotenv.config();

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Set up EJS view engine
app.set('views', path.join(path.resolve(), 'views'));
app.set('view engine', 'ejs');

// Render index page
app.get('/', (req, res) => {
    res.render('index', { message: '' });
});

// Set up JSON parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(json());
app.use('/', AppRouter);
app.use(handleErrors);



connectDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}).catch((error) => {
    console.log(`Error connecting to database: ${error}`);
});