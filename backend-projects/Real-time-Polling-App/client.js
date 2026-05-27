import { io } from "socket.io-client";
import readline from "readline";


const socket = io("http://localhost:3000");


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


socket.on("connect", () => {
    console.log(`Connected to server: ${socket.id}`);

    showMenu();
});


socket.on("pollResults", (poll) => {
    console.log("\n========== LIVE POLL RESULTS ==========");
    console.log(`\n${poll.question}\n`);

    for (const option in poll.options) {
        console.log(`${option}: ${poll.options[option]} votes`);
    }

    console.log("=======================================\n");
});


socket.on("errorMessage", (data) => {
    console.log("Error:", data.error);
});



socket.on("disconnect", () => {
    console.log("Disconnected from server");
});


function showMenu() {
    console.log("\nChoose your vote:");
    console.log("1. JavaScript");
    console.log("2. Python");
    console.log("3. Rust");

    rl.question("\nEnter option name: ", (answer) => {

        socket.emit("vote", {
            option: answer.trim(),
        });

        showMenu();
    });
}