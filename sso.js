var token = getURLParameter("access_token");
if (token.toString() == "null") {
  token = '';
}


$(document).ready(function() {

    if (app.user.uid) {
      // console.log("logged in!");
    } else {
      
      // console.log("not logged in!");
      
      var currentURL = document.URL;
      currentURL = currentURL.split("?")[0];
      
      if (token) {
    	  $.ajax('/login', {
          type: 'POST',
          data: 'username='+ token + '&password=contentblvd&remember=1&returnTo=' + currentURL,
          headers: {
          	'x-csrf-token': config.csrf_token
          },
          success: function() {
          	window.location.href = currentURL;
          }
        });
      }

    }
    
    $('#logged-out-menu a').each(function(){
      var target = $(this).attr('href');
      if (target == '/login') {
        $(this).attr('href', 'https://app.contentblvd.com/#/login');
      }
      if (target == '/register') {
        $(this).attr('href', 'https://app.contentblvd.com/#/signup');
      }
    });
    
});

function getURLParameter(name) {
    return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );     
}