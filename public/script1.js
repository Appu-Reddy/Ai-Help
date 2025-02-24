document.addEventListener('DOMContentLoaded', () => {
    const sendbtn = document.getElementById('send-message');
    const mssginp = document.getElementById('user-message');
    const chatbody = document.querySelector('.chat-body');
    const closebtn = document.getElementById('close-chotbot');
    const attachfilebtn = document.getElementById('attach-file-btn');
    const fileinp = document.getElementById('file-input');
    const openbutton = document.querySelector('#open-chatbot');

    let attachedfile = null;

    openbutton.style.display = "none";

    let username = prompt("Please enter your name:");
    while (!username) {
        username = prompt("Please enter your username:");
        if (!username) {
            alert("Username cannot be empty.");
        }
    }

    const socket = io();

    socket.emit("setusername", username); 

    socket.on("connect", () => {
        console.log("Connected to server.");
    });

    socket.on("newuser", (message) => {
        const mssgcont = document.createElement('div');
        console.log(message);
        mssgcont.innerHTML = `
            <div class="message-text">${message}</div>
        `;
        chatbody.appendChild(mssgcont);
        chatbody.scrollTop = chatbody.scrollHeight;
    });

    socket.on("receivemessage",(message)=>{
        const recmssgcont = document.createElement('div');
        recmssgcont.classList.add('message', 'user-message');
        recmssgcont.innerHTML = `
            <div class="message-text">${message}</div>
        `;
        chatbody.appendChild(recmssgcont);
        chatbody.scrollTop = chatbody.scrollHeight;
    });

    socket.on("botresponse", (response) => {
        botResponse(response);
    });

    function formatMessage(message) {
        message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
        message = message.replace(/```([\s\S]*?)```/g, function(_, code) {
            return `<pre style="margin: 10px 0; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word;">${code}</pre>`;
        });
    
        message = message.replace(/`(.*?)`/g, '<code>$1</code>');
    
        return message;
    }
    

    async function botResponse(message) {
        const botmssgcont = document.createElement('div');
        botmssgcont.classList.add('message', 'bot-message');
        botmssgcont.innerHTML = `
            <div class="thinking-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <div class="message-text">...</div>
        `;
        chatbody.appendChild(botmssgcont);
        chatbody.scrollTop = chatbody.scrollHeight;

        try {
            const response = await getBotResponse(message);

            setTimeout(() => {
                botmssgcont.querySelector('.thinking-indicator').remove();
                botmssgcont.querySelector('.message-text').innerHTML = formatMessage(response);
                chatbody.scrollTop = chatbody.scrollHeight;
            }, 1000);

        } 
        catch (error) {
            console.error('Error fetching bot response:', error);
            botmssgcont.querySelector('.thinking-indicator').remove();
            botmssgcont.querySelector('.message-text').textContent = 'Sorry, I could not understand that.';
        }
    }

    async function getBotResponse(message) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(message);
            }, 1000);
        });
    }

    closebtn.addEventListener('click', () => {
        chatbody.style.display = 'none';
        closebtn.style.display = 'none';
        openbutton.style.display = 'flex';
    });

    openbutton.addEventListener('click', () => {
        chatbody.style.display = 'flex';
        closebtn.style.display = 'flex';
        openbutton.style.display = 'none';
    });

    attachfilebtn.addEventListener('click', () => {
        fileinp.click();
    });

    fileinp.addEventListener('change', () => {
        const file = fileinp.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load",()=>{
                const filedata = reader.result;

                socket.emit("sendfile", {
                    filename: file.name,
                    filedata: filedata
                });
            });
            reader.readAsDataURL(file);
        }
    });

    socket.on("receivefile", (filedata, filename) => {
        const fileLink = document.createElement('div');
        fileLink.classList.add('message', 'user-message');
        fileLink.innerHTML = `<a href="${filedata}" download="${filename}" class="file" style="underline: none">File: ${filename}</a>`;
        chatbody.appendChild(fileLink);
        chatbody.scrollTop = chatbody.scrollHeight;
    });

    sendbtn.addEventListener('click', (e) => {
        e.preventDefault();
        const usermssg = mssginp.value.trim();

        if (usermssg) {
            mssginp.value = '';
            if (usermssg.startsWith('@aihelp')){
                socket.emit("sendmessage", `${usermssg}`);
            } 
            else {
                socket.emit("sendmessage", usermssg);
            }
        }
    });

    mssginp.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendbtn.click();
        }
    });
});
