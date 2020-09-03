
const fs = require( 'fs' ),
      path = require( 'path' ),
      Twit = require( 'twit' ),
      config = require( path.join( __dirname, 'config.js' ) ),
      cron = require( 'node-cron' );
const config = {
  consumer_key:         'TfwVdFJbuzqvBdSAqeVwnYLuZ',
  consumer_secret:      '5GZNiTRQM7eBvlFRxShsWwD7bOLdKYv5zcx3OFhduS31YXUavj',
  access_token:         '1300801814376460288-8w86qOB4IjexwQOvjBGwYo58kHVIBX',
  access_token_secret:  'QGeHCxTMzBDbqtgFAJfdrt9cislVapjwOBG5doX4gtu7I'
}
const T = new Twit( config );
let imagesArr = [];
let unusedImages = [];

// get array of images
fs.readdir(path.join( __dirname, '/images/'), (err, files) => {
  files.forEach(file => {
    if(file !== '.DS_Store') {
      imagesArr.push(file);
    }
  })
  unusedImages = [...imagesArr];

  tweet();
  // console.log('cron is running...');
  // cron.schedule('* * * * 1-5', () => {
  //   console.log(' ');
  //   tweet();
  // });

})

// FUNCTIONS
function tweet() {
 let idx = pickRandomNum(unusedImages);
  uploadRandomImage( idx );
  
  // remove from unused images array
  if(unusedImages.length > 1) {
    unusedImages.splice(idx, 1)
    console.log('unused images length:', unusedImages.length)
  } else {
    console.log('resetting unused images...')
    unusedImages = [...imagesArr];
  }
}
function pickRandomNum(arr) {
  console.log('picking a random image...');
  return Math.floor( Math.random() * arr.length )
}

function uploadRandomImage( index ){
  console.log( 'opening an image...' );
  
  const imagePath = path.join( __dirname, '/images/' + unusedImages[index] );
  const b64content = fs.readFileSync( imagePath, { encoding: 'base64' } );
  
  console.log( 'uploading an image...' );

  console.log('image path: ', imagePath)
  let url = 'https://macropolo.org/' + imagePath.substr(imagePath.indexOf('$') + 1, imagePath.length).replace('.png', '/') + '?source=@macropolocharts'
  console.log('URL:', url);

  T.post( 'media/upload', { media_data: b64content }, function ( err, data, response ) {
    if ( err ){
      console.log( 'error:', err );
    }
    else{
      console.log( 'image uploaded, now tweeting it...' );
      let params = { status: url, media_ids: new Array( data.media_id_string ) }
      
      T.post( 'statuses/update', params,
        function( err, data, response) {
          if (err){
            console.log( 'error:', err );
          }
          else{
            console.log( 'posted an image!' );
            console.log('---------------------------------');
          }
        }
      );
    }
  });

}