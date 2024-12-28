import { Server } from 'socket.io';

const io = new Server({
    cors: {
      origin: ['http://localhost:5000']
    }
});

const generateMessageId = () => Math.random().toString(36).substring(2, 10);

let chatRooms = [
    {
        roomId: 'GL-01',
        roomName: 'General Chat',
        description: 'The Chat room for any and everything',
        messages: [
          {
            id: 1,
            content: 'Welcome to the general chat!',
            sent: 'N/A',
            user: 'Admin'
          },
          {
            id: 2,
            content: 'Big sale for Memorial Day',
            sent: 'N/A',
            user: 'Admin'
          },
          {
            id: 7,
            content: 'Test post for Reggie',
            sent: 'N/A',
            user: 'reggie'
          }
        ],
    },
    {
        roomId: 'GL-02',
        roomName: 'Brands',
        description: 'The room to talk about Globomantics brands',
        messages: [
          {
            id: 3,
            content: 'Welcome to the Brand chat!',
            sent: 'N/A',
            user: 'Admin'
          },
          {
            id: 4,
            content: 'Automotive brand in introducing a new vehicle',
            sent: 'N/A',
            user: 'Admin'
          }
        ],
    },
    {
        roomId: 'GL-03',
        roomName: 'Robotics',
        description: 'The Chat room for our Robotics tech',
        messages: [
          {
            id: 5,
            content: 'Welcome to the Robotics!',
            sent: 'N/A',
            user: 'Admin'
          },
          {
            id: 6,
            content: 'New personal assistant Robot',
            sent: 'N/A',
            user: 'Admin'
          }
        ],
    }    
];

console.log('GLOBOCHAT SERVER STARTED');

io.on('connection', (socket) => {
    console.log(`connect: ${socket.id}`, socket.request.headers);

    socket.on('disconnect', () => {
        console.log(`disconnect: ${socket.id}`);
    });

    socket.on('getRooms', () => {
        console.log(`returning room list: `, chatRooms);
        socket.emit('returnRooms', chatRooms);
    });

    socket.on('connectRoom', (id) => {
        let chosenRoom = chatRooms.filter((room) => room.roomId == id);
        socket.join(chosenRoom[0].roomName);
        console.log('joined room :',chosenRoom[0].roomName);
        socket.emit('joinedRoom', chosenRoom[0].messages);
    });

    socket.on('newPost', (data) => {
        const {userMessage, room_id, sender, messageTime} = data;
        let selectedRoom = chatRooms.filter((room) => room.roomId == room_id);
        const addMessage = {
            id: generateMessageId(),
            content: userMessage,
            sent: messageTime,
            user: sender,  
        }
        console.log('New post ', addMessage);
        socket.to(selectedRoom[0].roomName).emit('channelMessage', addMessage);
        selectedRoom[0].messages.push(addMessage);
        io.to(selectedRoom[0].roomName).emit('newMessage', selectedRoom[0].messages);
        console.log('Emit new message', addMessage)    
    });
});

io.listen(3000);