document.addEventListener('DOMContentLoaded', function () {
	
	//variables for creating list
	const list = document.querySelector('.watch-list');
	const button = document.querySelector('button');
	let data = {};
	
	//variables for starting video
	const video = document.querySelector('.video-stream');
	const title = document.getElementById('watch-title');
	const time = document.getElementById('watch-time');
	const view = document.getElementById('watch-view');


	//
	// pulling data and initialize creating functions
	//

	function pullData () {
		let request = new XMLHttpRequest();
		request.onreadystatechange = function () {
	      if(request.readyState === 4 && request.status === 200) {
	        data = JSON.parse(request.responseText);
	        onDataReady();
	      } else {
	        console.log(request.statusText, request.readyState);
	      }
	  };
		request.open('GET', 'https://www.reddit.com/r/Music.json');
		request.send();
	}
	
	pullData();


	function onDataReady(){

		let videoList = [];
		let playlist = data.data.children;
		
		for (var i = playlist.length - 1; i >= 0; i--) {
			
			let item = playlist[i].data;
			
			if (item.domain === "youtube.com"){
				// let video = {
				// 	title: item.title,
				// 	score: item.score,
				// 	thumbnail: item.media.oembed.thumbnail_url,
				// 	url: item.url,
				// 	created: item.created_utc,
				// 	html: item.media.oembed.html
				// }
				// videoList.push(video);
				createListItem(item.title, item.score, item.media.oembed.thumbnail_url,
				 item.url, item.created_utc);
			}

		}

		// startVideo(parseId(playlist[0].data.url));
		// console.log(videoList);
	}
	

	//
	// adding video-items from data and initialize video
	//

	function createListItem(header, score, img, url, created) {
		let listItem = document.createElement("div");
		listItem.className = 'video-item';
		listItem.innerHTML = `
      <div class="preview">
      	<img src="${img}" alt="${header}">
      </div>
      <div class="item-title">
          <h5>${header}</h5>
          <p>${score}</p>
      </div>
		`;
		
		// creating event listener for each video of our list

		listItem.videoId = parseId(url);
		listItem.header = header;
		listItem.score = score;
		listItem.created = created;

		listItem.addEventListener('click', (e) => {
			let currentClass = e.target.className;
			if(currentClass !== 'video-item' && currentClass !== 'item-title') {
				let target = e.target.parentElement.parentElement;
				startVideo(target.videoId, target.header, target.score, target.created);
			}
		});

		list.appendChild(listItem);
	}
	
	function startVideo(id, header, score, created) {
		video.innerHTML = `
			 <iframe type="text/html" 
       width="426" height="240"
       src="https://www.youtube.com/embed/${id}"
       frameborder="0">
       </iframe>
		`;
		title.innerHTML = header;
		view.innerHTML = score;
		time.innerHTML = getTime(created);
	}
	

	//
	// adding new video from module window
	//

	
	function addListItem() {
		let listItem = document.createElement("div");
		listItem.className = 'video-item';
		listItem.innerHTML = `
      <div class="preview">Видео</div>
      <div class="item-title">
          <h4>Заголовок</h4>
          <p>Количество просмотров</p>
      </div>
		`;
		list.appendChild(listItem);
	}

	button.addEventListener('click', () => {
		addListItem();
	});

});


// 
// pure functions for parsing videoId and Time
// 

function parseId(url){
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    let match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
	}
	
// console.log('parseId', parseId('https://www.youtube.com/watch?v=b-v-lTtS_os'));

function getTime(ut) {
	let months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',
		 'августа', 'сентября', 'октября', 'ноября', 'декабря']
	let utTime = new Date(ut * 1000);
	let month = months[utTime.getMonth()];
	let time = `${utTime.getDate()} ${month} ${utTime.getFullYear()}`
	return time;
}