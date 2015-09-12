$(document).ready(function() {

    if (app.user.uid) {
      console.log("logged in!");
    } else {
      
      console.log("not logged in!");
      
      $.ajax('http://products.contentblvd.com:4000/getCurrent', {
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {
        	if (data && data.id) {
        	  var postData = "username=session&password=session&remember=1&returnTo=" + document.URL + "&email=" + data.email + "&id=" + data.id + "&avatar=" + data.avatar + "&first_name=" + data.first_name + "&last_name=" + data.last_name;
        	  if (data.media_properties.length) {
        	    postData += "&primary=" + data.media_properties[0].name;
        	  } else if   (data.brands.length) {
          	    postData += "&primary=" + data.brands[0].name;
        	  }
        	  $.ajax('/login', {
              type: 'POST',
              data: postData,
              headers: {
              	'x-csrf-token': config.csrf_token
              },
              success: function() {
              	window.location.href = document.URL;
              }
            });
        	}
        }
      });
  
      

    }
    
});