//
// ABOUT
//   Waits for mailchimp webhooks. Does stuff when someone subscribes or there is an error


//
// DEPS
var MailChimpWebhook = require('mailchimp').MailChimpWebhook;
var nconf = require('nconf');
var mail = require('mailgun-send');


//
// INIT

// grab config file
nconf.env(['MAILCHIMPKEY', 'MAILGUNKEY'])
    .file({ file: 'serverconf.json' });

var webhook = new MailChimpWebhook();


//
// MAKE STUFF HAPPEN

webhook.on('error', function (error) {
    console.log(error.message);
});

webhook.on('subscribe', function (data, meta) {
    console.log(data.email+' subscribed to your newsletter!'); // Do something with your data!
});

webhook.on('unsubscribe', function (data, meta) {
    console.log(data.email+' unsubscribed from your newsletter!'); // Do something with your data!
});