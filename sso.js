console.log("client js");

if (app.user.uid) {
  console.log("logged in!");
} else {
  
  console.log("not logged in!");
  var sessionId = 1;
  if (sessionId) {
    $.ajax({
      type: "POST",
      url: "/login",
      data: "username=session&password=session&remember=1&returnTo=" + document.URL
    });
  }
}