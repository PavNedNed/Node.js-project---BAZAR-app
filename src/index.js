import express from 'express';
import { engine } from 'express-handlebars';
import routes from './routes.js';

import * as helpers from './views/helpers/page.helpers.js';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { currentPageMiddleware } from './middlewares/navigation.middleware.js';

const app = express();

app.engine('hbs', engine({
    extname: 'hbs',
    helpers,
}));
app.set('view engine', 'hbs');
app.set('views', 'src/views');

// setup static files
app.use(express.static('src/static'));

// add middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(authMiddleware);

app.use(currentPageMiddleware);

// Routes
app.use(routes);


// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});