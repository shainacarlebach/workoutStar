const KEY = 'AIzaSyAfMe1atKlXhpOQjAoKJePz3JiGyz4igbQ';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const getComments = id => {
  const part = 'snippet';
  fetch(`${BASE_URL}/commentThreads?key=${KEY}&part=${part}&videoId=${id}`)
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log(data);
    });
};
const getVideoDetails = id => {
  const part = 'snippet,statistics';
  fetch(`${BASE_URL}/videos?key=${KEY}&part=${part}&id=${id}`)
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log(data);
    });
};
const getVideos = type => {
  const part = 'snippet';
  $('.training').empty();
  fetch(`${BASE_URL}/search?part=${part}&key=${KEY}&q=${type}`)
    .then(res => {
      return res.json();
    })
    .then(data => {
      data.items.map(video => {
        $('.training').append(
          `<div class="card col m-2"><img class="card-img-top" src=${video.snippet.thumbnails.high.url} alt="Card image cap"/> <div class="card-body"><p class="card-text">${video.snippet.title}</p></div></div>`
        );
      });
    });
};
