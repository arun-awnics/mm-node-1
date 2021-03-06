import EmailTemplate from 'email-templates';
import path from 'path';

var emailConfig = new EmailTemplate({
    send: true,
    transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'test.arung@gmail.com',
            pass: 'alphabet0711'
        },
        tls: {
            rejectUnauthorized: false
        },
    },
    views: {
        root: path.join(path.resolve('./'), '/dist/util/email-templates'),
        options: {
            extension: 'pug',
        },
    },
    juice: true,
    juiceResources: {
        preserveImportant: true,
        webResources: {
            relativeTo: path.join(path.resolve('./'), '/dist/util/email-templates'),
        }
    }

})
module.exports = emailConfig;
