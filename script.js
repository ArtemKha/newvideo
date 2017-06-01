document.addEventListener('DOMContentLoaded', () => {
	
	let list = document.querySelector('.watch-list');
	let button = document.querySelector('button');
	let data = {};

	
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
				let video = {
					title: item.title,
					url: item.url,
					created: item.created_utc,
					score: item.score,
					thumbnail: item.media.oembed.thumbnail_url,
					html: item.media.oembed.html
				}
				videoList.push(video);
			}
		}
		console.log(videoList);
	}
	

	function createListItem() {
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
		createListItem();
	});

});