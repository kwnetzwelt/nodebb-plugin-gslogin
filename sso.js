$(document).ready(function() {

    if (app.user.uid) {
      console.log("logged in!");
    } else {
      
      $.get( "https://app.contentblvd.com/getCurrent", function( data ) {
        console.debug(data);
      });
  
      console.log("not logged in!");
      var hasSessionCookie = document.cookie.match(/connect\.sid/);
      if (hasSessionCookie) {
          console.log(hasSessionCookie);
    			$.ajax('/login', {
    				type: 'POST',
    				data: "username=session&password=session&remember=1&returnTo=" + document.URL,
    				headers: {
    					'x-csrf-token': config.csrf_token
    				},
    				success: function() {
    					window.location.href = document.URL;
    				}
    			});
      } else {
        console.log("no session cookie found");
      }
    }
    
});