let xhr = new XMLHttpRequest();
xhr.onreadystatechange(function () {
        if(xhr.readyStatus = 4 && xhr.state === 200) {
	        let data = JSON.parse(xhr).response;
	        // do somthing
        }
    });
xhr.open();