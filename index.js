const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.get('/', function(req, res) {
   res.sendFile(`${ __dirname }/views/index.html`)
})

let rooms = {}

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   // console.log('A user connected')

   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      // console.log('A user disconnected')
   })

   const sendResponse = (roomId, tag, data)=>{
     socket.to(roomId).emit(tag, data)
   }

   socket.on('JOIN_ROOM', (roomId, cb) => {
     if(rooms[roomId] && rooms[roomId].start) return null

     socket.join(roomId)
     const users = io.sockets.adapter.rooms.get(roomId)
     const arrUsers = Array.from(users)
     rooms = { ...rooms, [roomId]: { start: false, users: arrUsers, token: arrUsers[0], card_count: 0 } }
     cb(rooms[roomId])
     sendResponse(roomId, 'COUNT', rooms[roomId])
   })

   socket.on('START_GAME', (roomId) => {
     rooms = { ...rooms, [roomId]: { ...rooms[roomId], start: true } }
     sendResponse(roomId, 'STARTED', true)
   })

   socket.on('PUT_CARD', (roomId) => {
     const users = io.sockets.adapter.rooms.get(roomId)
     const arrUsers = Array.from(users)

     let card_count = rooms[roomId].card_count
     card_count = card_count < arrUsers.length - 1? card_count +1 : 0
     const token = arrUsers[card_count]

     rooms = { ...rooms, [roomId]: { ...rooms[roomId], token, card_count  } }
     socket.to(token).emit('TOKEN', true)
   })
})

http.listen(3000, function() {
  console.log('listening on *:3000')
})
