/**
 * import dependencies
 */
import cookieParser from 'cookie-parser';
import express from 'express';
import flash from 'express-flash';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import lodash from 'lodash';
import http from 'http';
import https from 'https';
import fs from 'fs';
import socket from 'socket.io';

/**
 * import required files
 */
import MongoConfig from '../util/conn.mongo';
import socketService from '../apis/sockets/socket.service';
import log from './log4js.config';
import doctor from '../apis/doctor/doctor.controller';
import file from '../apis/file/file.controller';
import message from '../apis/message/message.controller';
import dialogFlow from '../apis/dialogFlow/dialogFlow.controller';
import swaggerSpec from './swagger.config';
import user from '../apis/user/user.controller';
import contactUs from '../apis/contact/contactUs.controller';
import group from '../apis/group/group.controller';
import orderRequest from '../apis/orderRequest/orderRequest.controller';
import specialities from '../apis/specialities/specialities.controller';
import passport from '../auth/authorization';
import authenticate from '../auth/authenticate';
import role from '../apis/role/role.controller';
import register from '../apis/register/register.controller';
import locations from '../apis/locations/locations.controller';
import visitor from '../apis/visitor/visitor.controller';
import audit from '../apis/audit/audit.controller';
import notification from '../apis/notification/notification.controller';
import languages from '../apis/languages/languages.controller';
import allergies from '../apis/allergies/allergies.controller';
import qualifications from '../apis/qualifications/qualifications.controller';
import consultationModes from '../apis/consultationModes/consultation-modes.controller';
import billing from '../apis/billing/billing.controller';
import payments from '../apis/payments/payments.controller';
import contactCareer from '../apis/contact-career/contact-career.controller';

class Config {
    constructor() {
        this.express = express;
        this.app = express();
        this.flash = flash;
        this.socket = socket;
        if (process.env.NODE_ENV === 'production') {
            this.http = https.createServer({
                key: fs.readFileSync('/etc/letsencrypt/live/mesomeds.com/privkey.pem', 'utf8'),
                cert: fs.readFileSync('/etc/letsencrypt/live/mesomeds.com/cert.pem', 'utf8'),
                ca: fs.readFileSync('/etc/letsencrypt/live/mesomeds.com/chain.pem', 'utf8')
            }, this.app);
        } else {
            this.http = http.Server(this.app);
        }
        this.io = this.socket.listen(this.http);
        this.dotenv = dotenv;
        this.lodash = lodash;
        this.dotenv.config({ path: '.env.dev' });
        this.mongo = new MongoConfig();
    }

    configureApp() {
        // set port to use
        this.app.set('port', (process.env.PORT));
        // use body parser as middleware
        this.app.use(bodyParser.json({ limit: '10mb' }));
        // use urlEncoder as middleware
        this.app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
        // use cookieParser as middleware
        this.app.use(cookieParser());
        // connect mongo server
        this.mongo.connect();
        // pass io object to establish socket connection
        socketService.connectSocket(this.io);
    }

    configureCORS() {
        // Additional middleware which will set headers that we need on each request.
        this.app.use((req, res, next) => {
            // Set permissive CORS header - this allows this server to be used only as
            // an API server in conjunction with something like webpack-dev-server.
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

            // Disable caching so we'll always get the latest userDetails.
            res.setHeader('Cache-Control', 'no-cache');
            // for preflighted requests with options
            if (req.method === 'OPTIONS') {
                res.status(200).end();
            } else {
                next();
            }
        });
    }

    configureRoutes() {
        // configuring routes
        this.app.get('/swagger.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });
        this.app.use('/', locations);
        this.app.use('/', specialities);
        this.app.use('/', languages);
        this.app.use('/', allergies);
        this.app.use('/', qualifications);
        this.app.use('/', consultationModes);
        this.app.use('/', contactCareer);
        this.app.use('/', register);
        this.app.use('/', authenticate);
        this.app.use('/', dialogFlow);
        this.app.use('/', audit);
        this.app.use('/', notification);
        this.app.use('/', passport.authenticate('jwt', { session: false }), payments);
        this.app.use('/', passport.authenticate('jwt', { session: false }), visitor);
        this.app.use('/', passport.authenticate('jwt', { session: false }), doctor);
        this.app.use('/', passport.authenticate('jwt', { session: false }), user);
        this.app.use('/', passport.authenticate('jwt', { session: false }), group);
        this.app.use('/', passport.authenticate('jwt', { session: false }), file);
        this.app.use('/', passport.authenticate('jwt', { session: false }), message);
        this.app.use('/', passport.authenticate('jwt', { session: false }), billing);
        //this.app.use('/role', role);
        //this.app.use('/contact', passport.authenticate('jwt', { session: false }), contactUs);
        //this.app.use('/orderRequest', passport.authenticate('jwt', { session: false }), orderRequest);
    }

    listen(port) {
        // start server at port
        this.http.listen(port, () => {
            log.info(`Server started: http://localhost:${port}/`);
        });
    }

    run() {
        // start application
        this.configureApp();
        this.configureCORS()
        this.configureRoutes();
        this.listen(this.app.get('port'));
    }
}

export default Config;