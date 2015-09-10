console.log("client js");

if (app.user.uid) {
  console.log("logged in!");
} else {
  
  console.log("not logged in!");
  var sessionId = 1;
  if (sessionId) {
    //require(['csrf'], function(csrf) {
      //console.log('inside require block');
      console.log(config);
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
    //});
    //$.ajax({
    //  type: "POST",
    //  url: "/login",
    //  data: "username=session&password=session&remember=1&returnTo=" + document.URL
    //});
  }
}