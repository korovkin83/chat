var express = require('express');
var Datastore = require('nedb');
const fs = require("fs");

var users = new Datastore({filename : 'users'});
users.loadDatabase();

var app = express();
app.use(express.static(__dirname + "/HTML/files"));

app.get('/', function (req, res) {  res.sendFile(__dirname + "/HTML/index.html"); });
app.get('/login', function (req, res) { res.sendFile(__dirname + "/HTML/login.html"); });
app.get('/register', function (req, res) { res.sendFile(__dirname + "/HTML/register.html"); });
app.get('/chat', function (req, res) { res.sendFile(__dirname + "/HTML/chat.html"); });


app.get('/api/register/:login/:pass', function (req, res) {
var login = req.params["login"];
var pass = req.params["pass"];
users.count({login:login }, function (err, count) {
	if (count == 1) {
    var event = {
        status: "0",
      };
      var str = JSON.stringify(event);
    res.send(str);
	} else {
		users.insert({login:login, pass:pass});
    var event = {
        status: "1",
        login: login
      };
      var str = JSON.stringify(event);
    res.send(str);
 }
	});

});


app.get('/api/login/:login/:pass', function (req, res) {
var login = req.params["login"];
var pass = req.params["pass"];
 users.count({login: login, pass:pass }, function (err, count) {
	if (count == 1) {

		users.find({login:login, pass:pass}, function (err, data) {
      var event = {
          status: "1",
          login: data[0].login
        };
        var str = JSON.stringify(event);
			res.send(str);
		});


	} else {
		var event = {
				status: "0",
			};
			var str = JSON.stringify(event);
		res.send(str);
	}
});
});




app.get('/api/msg/get', function (req, res) {
let fileContent = fs.readFileSync("msg.txt", "utf8");
res.send(fileContent);
});


server = app.listen("3000", () => console.log("Server is running..."));

const io = require("socket.io")(server)

io.on('connection', (socket) => {

    socket.on('set_username', (data) => {
        socket.username = data.username
    })

    socket.on('new_message', (data) => {
        var msg_text = socket.username + ": " + data.message + "<br>";
        fs.appendFileSync("msg.txt", msg_text);
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    })

    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
    })
})
