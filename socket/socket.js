module.exports = function(io,rooms){
    var chatrooms = io.of('/roomlist').on('connection', function(socket){           // any time the chatroomlist loads this executes.
        console.log('Connection Established on the server');

        socket.emit('givelist',JSON.stringify(rooms));

        socket.on('newroom', function(data){
            rooms.push(data);
            socket.broadcast.emit('roomupdate',JSON.stringify(rooms));            // broadcast the roomupdate event along with the list of rooms stringified. this broadcast will reach all otheres
                                                                                    // EXCEPT the one that made the room.
            socket.emit('roomupdate',JSON.stringify(rooms));                    // this emits the event to the room creator.
        });
    });

    var messages = io.of('/messages').on('connection',function(socket){         // connected to a chatroom


        socket.on('joinroom', function(data){                              // " socket" represents the current client
            console.log("user has joined the room")
            socket.username = data.user;
            socket.userPic = data.userPic;
            socket.join(data.room);                                          // lets the user join (push) the partition which is the room.
            updateUserList(data.room, true);                                 // "true" is to forcefully update list of users
        });

        socket.on('newMessage',function(data){
            socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));                          // propagate message to all users in that room except the active user. thus a                                                                                                                       // private conversation is possible.
        });

        function updateUserList(room, updateALL){
            var getRoom = io.of('/messages').adapter.rooms[room];                               // get the room object (which has a list of user ID's
            var getUsers = io.of('/messages').adapter.nsp.connected;                            // get the list of users and their data
            var userList = [];
            for (var i in getRoom){
                userList.push({username: getUsers[i].username, userPic:getUsers[i].userPic});
            }

            socket.emit('updateUsersList',JSON.stringify(userList));              // this gives the list to the single active client.

            if (updateALL){
                socket.broadcast.to(room).emit('updateUsersList',JSON.stringify(userList));
            }
        }

        socket.on('updateList', function(data){                                  // upon receiving the retrieve event from client send back the list by emitting another emit + data;
            updateUserList(data.room);
        });


    });
};
