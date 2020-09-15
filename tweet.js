
const fs = require( 'fs' ),
  path = require( 'path' ),
  Twit = require( 'twit' ),
  cron = require( 'node-cron' ),
  https = require( 'https' );
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
let imagesArr;

run();  

// FUNCTIONS
function run() {
  console.log('fetching random image...');
  fs.readFile('UNUSED_IMAGES.txt', 'utf-8', (err, data) => {
    if(err) throw err;

    // pick image from unused images list
    imagesArr = data.split(',\n');
    console.log(imagesArr)
    let num = pickRandomNum(imagesArr);
    console.log(num)
    let unusedTxt;

    // tweet
    tweet( num );

    // remove image from unused images list
    if(imagesArr.length < 2) {
      fs.readFile('ALL_IMAGES.txt', 'utf-8', (errr, response) => {
        console.log(response)
        unusedTxt = response;
        fs.writeFile('UNUSED_IMAGES.txt', unusedTxt, (error) => {
          if(error) throw error;
          console.log('**** Successful reset images list. ****');
        })
      })
    } else {
      imagesArr.splice(num, 1)
      unusedTxt = imagesArr.join(',\n')
      fs.writeFile('UNUSED_IMAGES.txt', unusedTxt, (error) => {
        if(error) throw error;
        console.log('**** Successful edit file. New length: ', imagesArr.length, '****');
      })
    }

    console.log('unusedTxt:', unusedTxt)
  })
}

function pickRandomNum(arr) {
  return Math.floor( Math.random() * arr.length )
}

function tweet( num ){
  imagePath = 'https://macropolo-s3.s3.us-east-2.amazonaws.com/twitter_charts/' + imagesArr[num];
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
