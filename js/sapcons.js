var SAAgent = null;
var SASocket = null;
var CHANNELID = 124;
var SecondChannel = 111;
var ProviderAppName = "aims";
var json = "";
var isProfile = false;
var isNews = false;
var isFriends = false;

var slider = {};
var progr = new Number();
var aimToOpen = new Object();

var likesText = {};
var dislikesText = {};

$("#about-target").on("pagebeforeshow", showabout);

function createHTML(log_string) {
	var log = document.getElementById('resultBoard');
	log.innerHTML = log.innerHTML + "<br> : " + log_string;
}

function showabout() {
	document.getElementById('header-target').innerHTML = aimToOpen.Header;
	console.log("Open: " + document.getElementById('header-target').innerHTML);
	
	document.getElementById('description-about').innerHTML = aimToOpen.Text;
	//document.getElementById('dprogress-about').value = aimToOpen.;
	var date = new Date(aimToOpen.EndDate);
	document.getElementById('sub-date-about').innerHTML = "Выполнить до: " + 
	date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
	
	document.getElementById("like-text").innerHTML = aimToOpen.Likes;
	document.getElementById("dislike-text").innerHTML = aimToOpen.DisLikes;
	
	//это не количество лайков!
	aimToOpen.liked = 0;
	aimToOpen.disliked = 0;
	
	likesText = document.getElementById("like-text");
	dislikesText = document.getElementById("dislike-text");
	
	likesText.innerHTML = aimToOpen.Likes;
	dislikesText.innerHTML = aimToOpen.DisLikes;
	
	var progress = (new Date()).getTime() - (new Date(aimToOpen.StartDate)).getTime();
	if(progress < 0) {
		progress = 0;
	}
	var allTime = (new Date(aimToOpen.EndDate)).getTime() - (new Date(aimToOpen.StartDate)).getTime();
	
	progr = progress/allTime * 100;
	
	
	if(progr > 100) {
		progr = 100;
	} else if(progr < 0) {
		progr = 0;
	}
	
	if(!aimToOpen.progress){
		document.getElementById("progress-about").value = progr;
		document.getElementById("progress-ratio-about").innerHTML = progr.toFixed(0) + "%";
	} else {
		document.getElementById("progress-about").value = aimToOpen.progress;
		document.getElementById("progress-ratio-about").innerHTML = aimToOpen.progress + "%";
	}
}


function openProof() {
	slider = document.getElementById("proof-slider");
	slider.value = progr;
	tau.openPopup("#proofPopup");
}

function makeProof() {
	progr = slider.value;
	aimToOpen.progress = progr;
	tau.closePopup();
	document.getElementById("progress-about").value = progr;
	document.getElementById("progress-ratio-about").innerHTML = progr + "%";
}

function liked() {
	//SASocket.sendData(SecondChannel, "like");
	if(aimToOpen.liked === 0){
		aimToOpen.liked = 1;
		if(aimToOpen.disliked === 1){
			aimToOpen.disliked = -1; //дизлайк есть, но нужно чтобы андроид часть не читала  1 в этой переменной
		}
		SASocket.sendData(SecondChannel, JSON.stringify(aimToOpen));
		likesText.innerHTML = parseInt(likesText.innerHTML) + 1;
		aimToOpen.Likes += 1;
	} else {
		likesText.innerHTML = parseInt(likesText.innerHTML) - 1;
		aimToOpen.Likes -= 1;
		aimToOpen.liked = 1; 
		if(aimToOpen.disliked === 1){
			aimToOpen.disliked = -1; //дизлайк есть, но нужно чтобы андроид часть не читала  1 в этой переменной
		}
		SASocket.sendData(SecondChannel, JSON.stringify(aimToOpen));
		aimToOpen.liked = 0;
	}
	
	console.log("Liked aim: " + JSON.stringify(aimToOpen));
} 

function doRequest(token) {
	
if(!SASocket){
	var msg = {
		"token": token,
		"userlogin": aimToOpen.Us.Login,
		"date": aimToOpen.Date
	};
	$.ajax({
		type: "GET",
		url: "http://backrestapi025036.azurewebsites.net/api/likes/likeaim/",
		data: msg,
		success: function(response) {
			console.log(response);
			SASocket.sendData(SecondChannel, JSON.parse(response).Token);
		},
		error: function(e) {
			console.log(e);
		}
	});
}

}

function disliked() {
	if(aimToOpen.disliked === 0){
		aimToOpen.disliked = 1;
		if(aimToOpen.liked === 1){
			aimToOpen.liked = -1; 
		}
		SASocket.sendData(SecondChannel, JSON.stringify(aimToOpen));
		dislikesText.innerHTML = parseInt(dislikesText.innerHTML) + 1;
		aimToOpen.DisLikes += 1;
	} else {
		dislikesText.innerHTML = parseInt(dislikesText.innerHTML) - 1;
		aimToOpen.DisLikes -= 1;
		aimToOpen.disliked = 1;
		if(aimToOpen.liked === 1){
			aimToOpen.liked = -1; 
		}
		SASocket.sendData(SecondChannel, JSON.stringify(aimToOpen));
		aimToOpen.disliked = 0;
	}
	console.log("Disliked aim: " + JSON.stringify(aimToOpen));
}

function parseProfile(str) {
	var data = [];
	var myPage = document.getElementById("mypage-list-targets");
	var user = json.User;

	var srcImage = 'data:image/jpeg;base64,' + user.Image;
	var newImage = document.createElement('img');
	newImage.src = srcImage;
	newImage.class = "ui-li-thumb-left";
	
	document.getElementById("info-img").src = srcImage;
	document.getElementById("info-name").innerHTML = user.Name;
	document.getElementById("info-login").innerHTML = user.Login;
	document.getElementById("info-email").innerHTML = user.Email;
	var sexs = ["Мужской", "Женский"];
	document.getElementById("info-sex").innerHTML = sexs[user.Sex - 1];
	document.getElementById("info-rating").innerHTML = user.Rating;
	
	data.push("<li class=\"li-has-multiline li-has-thumb-left\" id='main-info'> ",
	user.Name, 
	"<span class=\"ui-li-sub-text li-text-sub\">Ваш рейтинг: ",
	user.Rating,
	"</span>", newImage.outerHTML,
			"</li>");
	//data.push(json.Login);

	var aims1 = json.aim1;
	for(var i = 0; i < aims1.length; i++) {
		aims1[i].Us = user;
		aims1[i].Us.Image = null; //это нужно чтобы не гонять туда сюда большое количество символов
		aims1[i].Us.ImageMin = null;
		//console.log("Get aim1: " + JSON.stringify(aims1[i]));
		var date = new Date(aims1[i].EndDate);
		data.push("<li class='li-has-multiline'><a href='#'>",
						"<span class='target'>", aims1[i].Text, "</span>",
						"<span class='date ui-li-sub-text li-text-sub'>Выполнить до: ", 
						date.getDate(), ".", date.getMonth() + 1, ".", date.getFullYear(), "</span>" +
								"</a></li>");
	}
	
	var aims2 = json.aim2;
	for(i = 0; i < aims2.length; i++) {
		aims2[i].Us = user;
		aims2[i].Us.Image = null;
		aims2[i].Us.ImageMin = null;
		var date2 = new Date(aims2[i].EndDate);
		data.push("<li class='li-has-multiline'><a href='#'>",
						"<span class='target'>", aims2[i].Text, "</span>",
						"<span class='date ui-li-sub-text li-text-sub'>Выполнить до: ", 
						date2.getDate(), ".", date2.getMonth() + 1, ".", date2.getFullYear(), "</span>" +
								"</a></li>");
	}
	
	var aims3 = json.aim3;
	for(i = 0; i < aims3.length; i++) {
		aims3[i].Us = user;
		aims3[i].Us.Image = null;
		aims3[i].Us.ImageMin = null;
		var date3 = new Date(aims3[i].EndDate);
		data.push("<li class='li-has-multiline'><a href='#'>",
						"<span class='target'>", aims3[i].Text, "</span>",
						"<span class='date ui-li-sub-text li-text-sub'>Выполнить до: ", 
						date3.getDate(), ".", date3.getMonth() + 1, ".", date3.getFullYear(), "</span>" +
								"</a></li>");
	}
	myPage.innerHTML = data.join("");
	isProfile = true;
	
	console.log("Get user Info");
	
	var aims = aims1.concat(aims2, aims3);
	$("#mypage-list-targets li").click(function () {
		var index= $("#mypage-list-targets li").index(this);
		if(index !== 0) {
			console.log("Press target: " + index);
			aimToOpen = aims[index - 1];
			tau.changePage("#about-target");
			return false;
		}
		return true;
	});
}

function parseFriends(str) {
	var data = [];
	var listPage = document.getElementById('friends-list');
	var users = json.Users;
	for(var i in users) {
		var user = users[i];
		var srcImage = 'data:image/jpeg;base64,' + user.Image;
		var newImage = document.createElement('img');
		newImage.src = srcImage;
		newImage.class = "ui-li-thumb-left";
		data.push("<li class=\"li-has-multiline li-has-thumb-left\">",
					user.Name,
					"<span class=\"ui-li-sub-text li-text-sub\">", user.Login, "</span>",
					newImage.outerHTML,
				"</li>");
	}
	listPage.innerHTML = data.join("")
	isFriends = true;
	
	console.log("Get user Friends");
}

function parseNews(str) {
	var data = [];
	var feed = document.getElementById('news-feed');
	
	var aims1 = json.aim1;
	for(var i = 0; i < aims1.length; i++) {
		var date = new Date(aims1[i].Date);
		data.push("<li class=\"li-has-multiline li-has-2line-sub\">",
					"<a href=\"#\">",
					"<span class='target'>", aims1[i].Text, "</span>",
						"<span class=\"ui-li-sub-text li-text-sub\">Выполнить до: ", date.getDate(), ".", date.getMonth() + 1, ".", date.getFullYear(), "</span>",
						"<span class=\"ui-li-sub-text li-text-sub\">", aims1[i].Us.Name, "</span>",
					"</a>",
					"</li>");
	}
	
	var aims2 = json.aim2;
	for(i = 0; i < aims2.length; i++) {
		var date2 = new Date(aims2[i].Date);
		data.push("<li class=\"li-has-multiline li-has-2line-sub\">",
					"<a href=\"#\">",
					"<span class='target'>", aims2[i].Text, "</span>",
						"<span class=\"ui-li-sub-text li-text-sub\">Выполнить до: ", date2.getDate(), ".", date2.getMonth() + 1, ".", date2.getFullYear(), "</span>",
						"<span class=\"ui-li-sub-text li-text-sub\">", aims2[i].Us.Name, "</span>",
					"</a>",
					"</li>");
	}
	
	var aims3 = json.aim3;
	for(i = 0; i < aims3.length; i++) {
		var date3 = new Date(aims3[i].Date);
		data.push("<li class=\"li-has-multiline li-has-2line-sub\">",
					"<a href=\"#\">",
					"<span class='target'>", aims3[i].Text, "</span>",
						"<span class=\"ui-li-sub-text li-text-sub\">Выполнить до: ", date3.getDate(), ".", date3.getMonth() + 1, ".", date3.getFullYear(), "</span>",
						"<span class=\"ui-li-sub-text li-text-sub\">", aims3[i].Us.Name, "</span>",
					"</a>",
					"</li>");
	}
	
	feed.innerHTML = data.join("");
	isNews = true;
	
	console.log("Get user News");
}

function onerror(err) {
	console.log("ONERROR: err [" + err.name + "] msg[" + err.message + "]");
	alert("Ошибка: " + err.message);
}

var agentCallback = {
		onconnect: function(socket) {
			console.log("agentCallback onconnect" + socket);
			SASocket = socket;
			tau.openPopup("#connection-toast");
			//createHTML("startConnection");
			SASocket.setDataReceiveListener(onreceive);
			console.log("Listener established");
			SASocket.setSocketStatusListener(function(reason) {
				console.log("Service connection lost, Reason: [" + reason + "]");
				alert("Connection lost");
				disconnect();
			});
			//SASocket.sendData(CHANNELID, "request");
			//alert("SAP Connection estabilished with RemotePeer");
			fetch();
		},
			onerror: onerror
		};

var peerAgentFindCallback = {
		onpeeragentfound: function(peerAgent) {
			try {
				if(peerAgent.appName == ProviderAppName) {
					console.log(" peerAgentFindCallback::onpeeragentfound " + peerAgent.appname + " || " + ProviderAppName);
					SAAgent.setServiceConnectionListener(agentCallback);
					SAAgent.requestServiceConnection(peerAgent);
				} else {
					console.log(" peerAgentFindCallback::onpeeragentfound else");
					alert("Not expected app!! : " + peerAgent.appName);
				}
			} catch(err) {
				console.log("peerAgentFindCallback::onpeeragentfound exception [" + err.name + "] msg[" + err.message + "]");
			}
			},
			onerror : onerror
		};

function onsuccess(agents) {
	try {
		for(var i = 0; i < agents.length; i++) {
			console.log(i + ". " + agents[i].name);
		}
		if(agents.length > 0) {
			SAAgent = agents[0];
			
			SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
			SAAgent.findPeerAgents();
			console.log(" onsuccess " + SAAgent.name);
		} else {
			alert("Not found SAAGent!!");
			console.log(" onsucess else");
		}
	} catch(err) {
		console.log("onsuccess exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function onreceive(channelID, data) {
	
	if(channelID == SecondChannel) {
		doRequest(data);
	}
	
	//createHTML(data);
	json = null;
	json = JSON.parse(data);
	if(json.TypeOfRequest === "request_profile") {
		parseProfile(data);
	} else if(json.TypeOfRequest === "request_friends"){
		parseFriends(data);
	} else if(json.TypeOfRequest === "request_news") {
		parseNews(data);
	}
	if(isNews && isProfile && isFriends) {
		tau.closePopup();
		isNews = false;
		isProfile = false;
		isFriends = false;
	}
	
}

function connect() {
	if(SASocket) {
		//alert("Already connected");
		fetch();
		return false;
	} 
	try {
		webapis.sa.requestSAAgent(onsuccess, onerror);
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function fetch() {
	try {
		//connect();
		//SASocket.setDataRecieveListener(onreceive);
		//SASocket.sendData(CHANNELID, "Hello Accessory!");
		tau.openPopup("progress-popup");
		document.getElementById('cancel-popup').addEventListener('click', function(ev) {
			disconnect();
			tau.closePopup();
		});
		SASocket.sendData(CHANNELID, "request_profile");
		SASocket.sendData(CHANNELID, "request_friends");
		SASocket.sendData(CHANNELID, "request_news");
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function disconnect() {
	try {
		if(SASocket != null) {
			console.log("DISCONNECT SASOCKET NOT NULL");
			SASocket.close();
			SASocket = null;
			createHTML("closeConnection");
		}
	} catch(err) {
		console.log(" DISCONNECT ERROR: exception [" + err.name + "] msg[" + err.message + "]");
	}
}











