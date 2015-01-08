//
// ABOUT
//   Waits for mailchimp webhooks. Does stuff when someone subscribes or there is an error


//
// DEPS
var MailChimpWebhook = require('mailchimp').MailChimpWebhook;
var nconf = require('nconf');
var mail = require('mailgun-send');
var Q = require('q');

//
// INIT

// grab config file
nconf.env(['MAILCHIMPKEY',
           'MAILGUNKEY',
           'FROMMAILBOX',
           'ADMINMAILBOXS',
           'SALESMAILBOXS'])
    .file({ file: 'serverconf.json' });

var mailchimpKey = nconf.get('MAILCHIMPKEY');
var mailgunKey = nconf.get('MAILGUNKEY');
var fromMailBox = nconf.get('FROMMAILBOX');
var adminMailBoxs = nconf.get('ADMINMAILBOXS');
var salesMailBoxs = nconf.get('SALESMAILBOXS');

if (adminMailBoxs == undefined) throw new Error('could not get admin email addresses from config file');
if (salesMailBoxs == undefined) throw new Error('could not get sales email addresses from config file');
if (fromMailBox == undefined) throw new Error('could not get from email address from config file');
if (mailchimpKey == undefined) throw new Error('could not get mailchimp key from config file');
if (mailgunKey == undefined) throw new Error('could not get mailgun key from config file');




var webhook = new MailChimpWebhook();

mail.config({
  key: nconf.get('MAILGUNKEY'),
  sender: nconf.get('FROMMAILBOX')
});


//var funcs = [foo, bar, baz, qux];
//
//var result = Q(initialVal);
//funcs.forEach(function (f) {
//    result = result.then(f);
//});
//return result;
//mail.send({
//  subject: 'hello from myapp!',
//  recipient: 'user@email.com',
//  body: 'This is an email from myapp'
//});


var sendErrorEmail = function sendErrorEmail(errorMessage) {
    var result = Q();
    adminMailBoxs.forEach(function(address) {
        console.log('mailing: ' + address);
        mail.send({
            subject: 'ALERT = Mobiletalk website error',
            recipient: address,
            body: 'There was a mailchimp error: ' + errorMessage
        });
        result = result.then(address);
    });
};

var sendSubscriptionAlert = function sendSubscriptionAlert(data, meta) {
    var result = Q();
    salesMailBoxs.forEach(function(address) {
        console.log('mailing: ' + address);
        mail.send({
            subject: 'Notification - Mobiletalk newsletter subscription',
            recipient: address,
            body: 'New potential! ' +  data.email + ' has subscribed to the Mobiletalk newsletter. [dev]: ' + meta
        });
        result = result.then(address);
    });
};

//
// MAKE STUFF HAPPEN

webhook.on('error', function (error) {
    console.log(error.message);
    sendErrorEmail(error);
});

webhook.on('subscribe', function (data, meta) {
    console.log(data.email+' subscribed to your newsletter!'); // Do something with your data!
    sendSubscriptionAlert(data, meta);
});

webhook.on('unsubscribe', function (data, meta) {
    console.log(data.email+' unsubscribed from your newsletter!'); // Do something with your data!
});