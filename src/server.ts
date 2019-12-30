import express from 'express';
import session from 'express-session';
import { randomBytes } from 'crypto';
import { Dropbox } from 'dropbox';
import NodeCache from 'node-cache';
import fetch from 'isomorphic-fetch';

require('dotenv').config();

// Declaring process.env types for sessionOptions typecheck
declare const process: {
  env: {
    PORT: number | undefined;
    SESSION_ID_SECRET: string;
    DBX_APP_KEY: string;
    DBX_APP_SECRET: string;
  };
};

// Redirect URL to pass to Dropbox. Has to be whitelisted in Dropbox app settings
const OAUTH_REDIRECT_URL = 'http://localhost:3000/auth';

// Dropbox configuration
const config = {
  fetch,
  clientId: process.env.DBX_APP_KEY,
  clientSecret: process.env.DBX_APP_SECRET,
};

const dbx = new Dropbox(config);
const mycache = new NodeCache();

const home = async (req: any, res: any, next: any) => {
  let status = '';

  if (!req.session.token) {
    // Create a random state value
    const state = randomBytes(16).toString('hex');

    // Save state and the session id for 10 mins
    // Used to verify later
    mycache.set(state, req.session.id, 6000);

    // Get authentication URL and redirect
    const authUrl = dbx.getAuthenticationUrl(OAUTH_REDIRECT_URL, state, 'code');
    console.log(`OAUTH URL: ${authUrl}`);
    return res.redirect(authUrl);
  }

  // If a token exists, it can be used to access Dropbox resources
  dbx.setAccessToken(req.session.token);

  try {
    const accountDetails = await dbx.usersGetCurrentAccount();
    const displayName = accountDetails.name.display_name;
    dbx.setAccessToken(''); // Clear token
    status = 'Success!';

    return res.json({
      status,
      message: `Accessed Dropbox account of ${displayName} with token ${req.session.token}`,
    });
  } catch (error) {
    status = 'Failed';
    dbx.setAccessToken('');
    return res.json({
      status,
      message: error,
    });
  }
};

// Redirect from Dropbox
const auth = async (req: any, res: any, next: any) => {
  if (req.query.error_description) {
    return next(new Error(req.query.error_description));
  }

  // Validate state ensuring there is a session id associated with it
  const { state } = req.query;
  if (!mycache.get(state)) {
    return next(new Error('session expired or invalid state'));
  }

  // Exchange code for token
  if (req.query.code) {
    try {
      const token = await dbx.getAccessTokenFromCode(
        OAUTH_REDIRECT_URL,
        req.query.code,
      );
      req.session.token = token; // STORE THIS ACCESS TOKEN
      mycache.del(state);
      return res.redirect('/');
    } catch (error) {
      return next(error);
    }
  } else {
    return res.redirect('/');
  }
};

const port = process.env.PORT || 3000;
const app = express();

// Session setup
const sessionOptions = {
  secret: process.env.SESSION_ID_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // only for dev purpose
};
app.use(session(sessionOptions));

// CORS
app.use(function(req, res, next): void {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

const router = express.Router();
router.get('/', home); // home route
router.get('/auth', auth); // redirect route
app.use('/', router);

app.listen(port, () => console.log(`Server is running on port ${port}`));
