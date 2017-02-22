/**
*	Client's constructor that will communicates with the prolog server
*/
function Client(message){
	console.log(message);
}

Client.prototype.constructor = Client;

//Gets the prolog requests
Client.prototype.getPrologRequest = function(requestString, onSuccess, onError, port){
	var requestPort = port || 8081;
	var request = new XMLHttpRequest();
	request.open('GET', 'http://localhost:'+ requestPort + '/' + requestString, true);

	request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
	request.onerror = onError || function(){console.log("Error waiting for response");};

	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	request.send();
}