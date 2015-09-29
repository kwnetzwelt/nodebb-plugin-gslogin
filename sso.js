var token = getURLParameter("access_token");
if (token.toString() == "null") {
  token = '';
}


$(document).ready(function() {

    if (app.user.uid) {
      console.log("logged in!");
    } else {
      
      console.log("not logged in!");
      
      if (token) {
    	  $.ajax('/login', {
          type: 'POST',
          data: 'username='+ token + '&password=contentblvd&remember=1&returnTo=' + document.URL,
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

function getURLParameter(name) {
    return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );     
}