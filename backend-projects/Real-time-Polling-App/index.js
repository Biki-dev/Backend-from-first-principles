import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());

const PORT = 3000;

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "*",
    },
});


const polls = {
    poll1: {
        question: "Favorite Programming Language?",
        options: {
            JavaScript: 0,
            Python: 0,
            Rust: 0,
        },
    },
};


io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);


    socket.emit("pollResults", polls.poll1);


    socket.on("vote", (data) => {
        console.log(`Vote received from ${socket.id}:`, data);

        const { option } = data;

        const poll = polls.poll1;


        if (!poll.options.hasOwnProperty(option)) {
            socket.emit("errorMessage", {
                error: "Invalid voting option",
            });

            return;
        }


        poll.options[option]++;

        console.log("Updated Poll:", poll.options);


        io.emit("pollResults", poll);
    });


    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});