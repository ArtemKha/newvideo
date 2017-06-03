document.addEventListener('DOMContentLoaded', function () {
	
	// 
	// functions for localStorage 
	//

	function supportsLocalStorage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e){
      return false;
    }
  }

  function getVideoList(){
  	if (supportsLocalStorage()) {
	    videoList = localStorage.getItem('videoList');
	    if (videoList) {
	        console.log('return json from ls (getVideoList)');
	        return JSON.parse(videoList);
	    } else {
	    	console.log('return clean massive (getVideoList)');
	    	return [];
	    }
  	} else return false;
  } 

  function saveVideoList(str) {
  	if (supportsLocalStorage()) {
	    videoList = getVideoList();
	    if (videoList.indexOf(str) > -1 || !str) {
	      return false;
	    }
	    videoList.push(str);
	    localStorage.setItem('videoList', JSON.stringify(videoList));
	    return true;
	  } else return false;
  }
  
	
	//variables for creating list
	let videoList;
	const list = document.querySelector('.watch-list');
	const button = document.querySelector('button');
	
	//variables for starting video
	const video = document.querySelector('.video-stream');
	const title = document.getElementById('watch-title');
	const time = document.getElementById('watch-time');
	const view = document.getElementById('watch-view');


	function initializeApp(){
		videoList = getVideoList();
		if (videoList.length === 0) {
			pullDataServer();
		} else {
	  	onDataReady();
		}
	}
	
	initializeApp();

	//
	// pulling data
	//
	
	function pullDataServer() {
		let request = new XMLHttpRequest();
		request.open('GET', 'https://www.reddit.com/r/Music.json');
		request.onload = function () {
      if(request.readyState === 4 && request.status === 200) {
        console.log('parse json from server (pullDataServer');
        videoList = JSON.parse(request.responseText);
	  		onDataReady();
      } else {
        console.log(request.statusText, request.readyState);
      }
	  };
		request.send();
	}
	
	//
	// calling creating video-list function
	//

	function onDataReady(){
		
		if (videoList[0]) {

			for (var i = videoList.length - 1; i >= 0; i--) {
				// console.log(videoList[i].header);
				createListItem(videoList[i]);
			}

		} else {

			let playlist = videoList.data.children;
			for (var i = playlist.length - 1; i >= 0; i--) {
				let item = playlist[i].data;
				if (item.domain === "youtube.com"){
					let info = {
						header: item.title,
						score: item.score,
						img: item.media.oembed.thumbnail_url,
						url: item.url,
						created: item.created_utc,
					}
				createListItem(info);
				saveVideoList(info);
			}
		}


		}

		let firstVideo = document.querySelector('.video-item');
		startVideo(firstVideo.info);
	}
	

	//
	// adding video-items from data and initialize video
	//

	function createListItem(info) {
		let listItem = document.createElement("div");
		listItem.className = 'video-item';
		listItem.innerHTML = `
      <div class="preview">
      	<img src="${info.img}" alt="${info.header}">
      </div>
      <div class="item-title">
          <h5>${info.header}</h5>
          <p>${info.score}</p>
      </div>
		`;
		
		// creating event listener for each video of our list

		listItem.info = info;

		listItem.addEventListener('click', (e) => {
			let currentClass = e.target.className;
			if(currentClass !== 'video-item' && currentClass !== 'item-title') {
				let targetInfo = e.target.parentElement.parentElement.info;
				startVideo(targetInfo);
			}
		});

		list.appendChild(listItem);
	}
	
	function startVideo(info) {

		let id = parseId(info.url);
		video.innerHTML = `
			 <iframe type="text/html" 
       width="426" height="240"
       src="https://www.youtube.com/embed/${id}"
       frameborder="0">
       </iframe>
		`;
		title.innerHTML = info.header;
		view.innerHTML = info.score;
		time.innerHTML = getTime(info.created);
	}
	

	//
	// adding new video from module window
	//

	
	function addListItem() {
		let listItem = document.createElement("div");
		listItem.className = 'video-item';
		listItem.innerHTML = `
      <div class="preview">
      	<img src="{info.img}" alt="{info.header}">
      </div>
      <div class="item-title">
          <h5>{info.header}</h5>
          <p>{info.score}</p>
      </div>
		`;
		list.appendChild(listItem);
	}

	button.addEventListener('click', () => {
		// addListItem();
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
});