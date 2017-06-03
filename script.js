document.addEventListener('DOMContentLoaded', function () {

	//variables for creating list
	let videoList;
	const list = document.querySelector('.watch-list');
	const button = document.querySelector('button');
	
	//variables for starting video
	const video = document.querySelector('.video-stream');
	const title = document.getElementById('watch-title');
	const time = document.getElementById('watch-time');
	const view = document.getElementById('watch-view');

	//variables for adding video
  const form = document.getElementById('upload-form');
  let titleform = document.getElementsByName("title")[0];
  let scoreform = document.getElementsByName("score")[0];
  let urlform = document.getElementsByName("url")[0];
  let submit = document.getElementsByName("submit")[0];

	//variables for search
  const searchform = document.getElementById('searchform');
  const searchinput = document.getElementsByName('searchinput')[0];

	
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
	
	function isIncluded(info){
		if (videoList) {
			for (let i = 0; i < videoList.length; i++) {
				if(videoList[i].header === info.header) {
					return true;
				}
			}
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

  function saveVideoList(info) {
  	if (supportsLocalStorage()) {
	    videoList = getVideoList();
	    if (videoList.indexOf(info) > -1 || !info) {
	      return false;
	    }
	    videoList.push(info);
	    localStorage.setItem('videoList', JSON.stringify(videoList));
	    return true;
	  } else return false;
  }
  
	
	function initializeApp(){
		videoList = getVideoList();
		if (videoList.length === 0) {
			pullDataServer();
		} else {
	  	onDataReady(videoList);
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
	  		onDataReady(videoList);
      } else {
        console.log(request.statusText, request.readyState);
      }
	  };
		request.send();
	}
	
	//
	// calling creating video-list function
	//

	function onDataReady(list){
		
		if (list[0]) {

			for (var i = list.length - 1; i >= 0; i--) {
				createListItem(list[i]);
			}

		} else {

				let playlist = list.data.children;
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

		listItem.info = info;
		appendVideo(listItem);
	}

	function appendVideo(listItem) {
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

	
	function addListItem(info) {
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
		listItem.info = info;

		saveVideoList(info);
		appendVideo(listItem);
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		let videoId = parseId(urlform.value);
		let info = {
			header: titleform.value,
			score: scoreform.value,
			img: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
			url: urlform.value,
			created: new Date().getTime()/1000
		}
		if (!isIncluded(info)){
			addListItem(info);
		} else console.log('already here');
	});
	
	submit.addEventListener('click', function() {
		window.location.href='#modal-close';
	});

	// 
	// search engine
	// 

	function search (query) {
		if (videoList) {
			let newArr = [];
			for (let i = 0; i < videoList.length; i++) {
				let match = isQueryIncluded(videoList[i].header, query)
				if (match) {
					newArr.push(videoList[i]);
				}
			}
			searchinput.value = '';
			return newArr;
		}
	}

	function isQueryIncluded(headerOf, query) {
		let regex = new RegExp(query, 'i');
		return headerOf.match(regex);
	}
	

	searchform.addEventListener('submit', function(e) {
		e.preventDefault();
		let query = searchinput.value;
		list.innerHTML = '';
		onDataReady(search(query));
	});
	
	// 
	// pure functions for parsing videoId and Time
	// 

	function parseId(url){
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    let match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
	}
	

	function getTime(ut) {
		let months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',
			 'августа', 'сентября', 'октября', 'ноября', 'декабря']
		let utTime = new Date(ut * 1000);
		let month = months[utTime.getMonth()];
		let time = `${utTime.getDate()} ${month} ${utTime.getFullYear()}`
		return time;
	}
});