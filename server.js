
const fs = require( 'fs' ),
  path = require( 'path' ),
  Twit = require( 'twit' ),
  cron = require( 'node-cron' ),
  https = require('https');
const config = {
  consumer_key:         'TfwVdFJbuzqvBdSAqeVwnYLuZ',
  consumer_secret:      '5GZNiTRQM7eBvlFRxShsWwD7bOLdKYv5zcx3OFhduS31YXUavj',
  access_token:         '1300801814376460288-8w86qOB4IjexwQOvjBGwYo58kHVIBX',
  access_token_secret:  'QGeHCxTMzBDbqtgFAJfdrt9cislVapjwOBG5doX4gtu7I'
}
const T = new Twit( config );

let imagePath;
let b64content;
let url;
let title;

const imagesArr = [
  'AI_Commentary_2$americas-got-ai-talent-us-big-lead-in-ai-research-is-built-on-importing-researchers.png',
  'AI_talent_commentary_1$americas-got-ai-talent-us-big-lead-in-ai-research-is-built-on-importing-researchers.png',
  'AI_Talent_Screenshot_3$americas-got-ai-talent-us-big-lead-in-ai-research-is-built-on-importing-researchers.png',
  'Billion_Users_$the-chinese-and-american-tech-apps-winning-the-next-billion-users.png',
  'Chips_on_the_shoulder_2$china-chips-semiconductors-artificial-intelligence.png',
  'Chips_on_the_shoulder1$china-chips-semiconductors-artificial-intelligence.png',
  'Chips_on_the_shoulder3$china-chips-semiconductors-artificial-intelligence.png',
  'ev_new_energy_1$analysis-china-electric-vehicle-ev-industry.png',
  'EV_new_energy_2$analysis-china-electric-vehicle-ev-industry.png',
  'ev_new_energy_3$analysis-china-electric-vehicle-ev-industry.png',
  'Great_Power_1$china-great-power-foreign-policy-covid19.png',
  'Great_Power_2$china-great-power-foreign-policy-covid19.png',
  'Great_Power_3$china-great-power-foreign-policy-covid19.png',
  'Great_Power_4$china-great-power-foreign-policy-covid19.png',
  'Interest_rate$china-interest-rate-cut-economy.png',
  'Much_ado_about_data1$ai-data-us-china.png',
  'Retirement_1$why-beijing-has-resisted-raising-the-retirement-age.png',
  'Retirement_2$why-beijing-has-resisted-raising-the-retirement-age.png',
  'SHFTZ_1$shanghai-free-trade-zone-reform-opening.png',
  'SHFTZ_2$shanghai-free-trade-zone-reform-opening.png',
  'SHFTZ_4$shanghai-free-trade-zone-reform-opening.png',
  'SHFTZ3$shanghai-free-trade-zone-reform-opening.png',
];

run();  

// FUNCTIONS
function run() {
  console.log('fetching random image...');
  let img = pickRandomNum(imagesArr);
  console.log(img)
  tweet( img );
}

function pickRandomNum(arr) {
  return Math.floor( Math.random() * arr.length )
}

function tweet( img ){
  imagePath = 'https://macropolo-s3.s3.us-east-2.amazonaws.com/twitter_charts/' + imagesArr[img];
  console.log(imagePath);

  https.get(imagePath, (resp) => {
    console.log('converting image to base64...');
    let chunks = [];
    resp.on('data', (data) => { chunks.push(data)});
    resp.on('end', () => {
      const buffer = Buffer.concat(chunks).toString('base64');
      b64content = buffer;
      console.log('image converted, compiling rest of tweet...');
      console.log('image path: ', imagePath)
      url = 'https://macropolo.org/' + imagePath.substr(imagePath.indexOf('$') + 1, imagePath.length).replace('.png', '/') + '?source=@macropolocharts'
      console.log('URL:', url);
      title = imagePath.substring(imagePath.indexOf('charts/') + 7, imagePath.indexOf('$'));
      title = title.replace(/_/g, ' ');
      console.log('Title:', title);

      // do it
      console.log('uploading image...');
      T.post( 'media/upload', { media_data: b64content }, function ( err, data, response ) {
        if ( err ){
          console.log( 'error:', err );
        }
        else{
          console.log( 'image uploaded, now tweeting...' );
          let params = { status: title + '\n' + url, media_ids: new Array( data.media_id_string ) }
          
          T.post( 'statuses/update', params,
            function( err, data, response) {
              if (err){
                console.log( 'error:', err );
              }
              else{
                console.log( 'posted!' );
                console.log('---------------------------------');
              }
            }
          );
        }
      });
    });
  }).on('error', (e) => {
      console.log(`Got error: ${e.message}`);
  });
}
