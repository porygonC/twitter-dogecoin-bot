const Twitter = require('twitter');
const { RestClient } = require('ftx-api');
require('dotenv/config');

// Elons twitter user ID
const follow_id = '44196397';
// const follow_id = process.env.followid; // for testing with your own twitter account

// Keywords to check for in his tweets
const keywords = ['doge', 'coin', 'moon', 'meme', 'hodl'];

const ftx_client = new RestClient(
  process.env.ftx_apikey,
  process.env.ftx_apisecret
)

const twitter_client = new Twitter({
    consumer_key: process.env.twitter_apikey,
    consumer_secret: process.env.twitter_apisecret,
    access_token_key: process.env.twitter_accesstoken,
    access_token_secret: process.env.twitter_accesstokensecret
});

twitter_client.stream('statuses/filter', {follow: follow_id},  (stream) => {
    
  stream.on('data', (tweet) => {
    // Check that it's Elon, because twitter also streams replies
    if (tweet.user.id_str == follow_id) {
      console.log('New tweet from Elon!');
      
      const text = tweet.text.toLowerCase();

      // Check that he's tweeting about crypto
      if (keywords.some(keyword => text.includes(keyword))) {
        console.log('It\'s doge time:', text, '\n');

        // Process buying of dogecoin
        ftx_client.placeOrder({
          market: 'DOGE-PERP',
          side: 'buy',
          price: null,
          type: 'market',
          size: 1000,
          reduceOnly: false,
          ioc: false,
          postOnly: false,
          clientId: 'thanksElon'
        })
        .then(result => {
          console.log("Placed order: ", result);
        })
        .catch(err => {
          console.error("placeOrder error: ", err);
        });

      } else {
        console.log('It was about something else this time:', text, '\n');
      }
    }
  });
  
  stream.on('error', (error) => {
    console.error(error);
  });
});