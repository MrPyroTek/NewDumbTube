function Start(){
  var x = document.getElementById("fname").value;
  document.getElementById("demo").innerHTML = x;
  
 var site = 'https://www.youtube.com/embed/'+x+'?autoplay=1&mute=1';
 document.getElementById('Video').src = site;
 
  Load(x);
}

function Load(defaultId) {
const main = async() => {
  //const defaultId = 'rSolw1ijvOw'; // Queen – Bohemian Rhapsody (default ID)
  const json = await loadYouTubeSubtitles(getYouTubeVideoId() || defaultId);
  const csv = jsonToCsv(json, {
    includeHeader: false,
    ignoreKeys: ['dur'],
    delimiter: '\t',
  });

  console.log(csv);
};

const parseTranscript = ({ events }) => {
  return events.map(({ tStartMs, dDurationMs, segs: [{ utf8 }] }) => ({
    start: formatTime(tStartMs),
    dur: formatTime(dDurationMs),
    text: utf8
  }));
};

const formatTime = (seconds) => {
  let date = new Date(null);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
};

const getYouTubeVideoId = () => {
  var video_id = window.location.search.split('v=')[1];
  if (video_id != null) {
    var ampersandPosition = video_id.indexOf('&');
    if (ampersandPosition != -1) {
      return video_id.substring(0, ampersandPosition);
    }
  }
  return null;
};

const loadYouTubeSubtitles = async(videoId, options) => {
  options = Object.assign({
    baseUrl: 'https://video.google.com/timedtext',
    languageId: 'en',
  }, options || {});

  const requestUrl = `${options.baseUrl}?lang=${options.languageId}&v=${videoId}&fmt=json3`;
  const response = await fetch(requestUrl);
  const json = await response.json();

  return parseTranscript(json);
};

const jsonToCsv = (json, options) => {
  options = Object.assign({
    includeHeader: true,
    delimiter: ',',
    ignoreKeys: []
  }, options || {});
  let keys = Object.keys(json[0]).filter(key => options.ignoreKeys.indexOf(key) === -1);
  let lines = [];
  if (options.includeHeader) {
    lines.push(keys.join(options.delimiter));
  }
  return lines.concat(json
      .map(entry => keys.map(key => entry[key]).join(options.delimiter)))
    .join('\n');
};

main();
}