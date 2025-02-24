const express = require('express');
const app = express();
const http = require('http');
const socketio = require("socket.io");
const cors = require("cors");
const axios = require('axios');
const dns = require('dns');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(express.static('public'));

let users = {};

io.on("connect", (socket) => {

    socket.on("setusername", (username) => {
        users[socket.id] = username;
        console.log(`${username} joined...`);
        socket.broadcast.emit("newuser", `${username} joined the chat!`);
    });

    socket.on("sendmessage", async (message) => {

        if (message.startsWith('@aihelp')) {
            io.emit("receivemessage", message);
            const mssg = message.replace('@aihelp', '').trim();
            try {
                const botres = await getbotresponse(mssg);
                io.emit("botresponse", botres);
            } catch (error) {
                console.error("Error in generating bot response:", error);
                io.emit("botresponse", "Error in generating response.");
            } 
        }
        else {
            const username = users[socket.id] || "Unknown";
            const mssg = `${username}: ${message}`;
            io.emit("receivemessage", mssg); 
        }
    });

    socket.on("sendfile", (data) => {
        io.emit("receivefile", data.filedata, data.filename);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
        io.emit("newuser", `${users[socket.id]} disconnected`);
        delete users[socket.id];
    });
});

async function isinternetavailable() {
    return new Promise((resolve) => {
        dns.lookup('google.com', (err) => {
            if (err) resolve(false);
            else resolve(true);
        });
    });
}

async function getgeminibotresponse(message) {
    const apiKey = process.env.API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const data = {
        contents: [
            {
                parts: [
                    { text: message }
                ]
            }
        ]
    };

    try {
        const response = await axios.post(apiUrl, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        const result = response.data;
        if (result && result.candidates && result.candidates.length > 0) {
            const candidate = result.candidates[0];
            const parts = candidate.content.parts;
            if (parts && parts.length > 0) {
                return parts[0].text;
            } else {
                return "No content found in response.";
            }
        } else {
            throw new Error('No candidates found in response.');
        }
    } catch (error) {
        console.error('Error fetching response from Gemini API:', error);
        throw error;
    }
}

async function getOllamabotresponse(message) {
    const apiUrl = 'http://127.0.0.1:11434/api/generate';
    const data = {
        model: "llama3",
        prompt: message,

        // Extra features ---

        /*repeat_penalty: 1.0,
        temperature: 0.2,
        tfs_z: 1.0,
        min_p: 0.0,
        tio_k: 10,*/

        stream: false
    };

    try {
        const response = await axios.post(apiUrl, data, { headers: { 'Content-Type': 'application/json' } });
        if (response.data && response.data.response) {
            return response.data.response;
        } else {
            throw new Error('No response found in API response.');
        }
    } catch (error) {
        console.error('Error fetching response from Ollama API:', error);
        throw error;
    }
}

async function getbotresponse(message) {
    const isOnline = await isinternetavailable();
    if (isOnline) {
        return await getgeminibotresponse(message);
    } else {
        return await getOllamabotresponse(message);
    }
}

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});
