# Group Chat + AI

This **Group Chat + AI** application enables users to have real-time interactive conversations with a bot in a group chat setting. It provides features like:

- **Personalized Usernames**: Set your name and chat with others.
- **File Sharing**: Share files with others in the chat.
- **Intelligent Responses**: The bot gives intelligent responses powered by external APIs like **Gemini** and **Ollama**.
- **Code Generation**: The bot can generate code snippets based on user queries.

The user interface is simple and intuitive, making it easy to start chatting and sharing files. It's a fun and helpful tool for quick answers, casual conversations, and collaborative chatting.

---

## 🛠 Prerequisites

Before you begin, ensure you have the following:

1. **Ollama (with `llama3` model)**
2. **Node.js v18 to v22**
3. **Gemini Api Key**

---

## 📝 Process

### 1. Install Ollama

For **Windows** users:
- Download the Ollama installer from the [Ollama official website](https://ollama.com) and follow the installation instructions.

For **macOS** and **Linux** users:
- You can install Ollama using Homebrew on macOS or follow the relevant installation guides on the [Ollama GitHub repository](https://github.com/ollama/ollama) for Linux.

### 2. Download an Ollama Model

To interact with the model in your application, you'll need to download one of Ollama’s models.

#### Steps:

- **View available models**:
  ```bash
  ollama models

- **Download the llama3 model:**
    ```bash
    ollama pull llama3

- **Start the model server (only if you need to run it offline):**
    ```bash
    ollama serve

- **Ollama Server Status**
    After running the ollama serve command, the server should start locally. You should see an output like this:

    ```bash
    Ollama server started at http://localhost:11434

##### To run the server, use the command `node server.js`.
#
##### This will start your server on port 3001 (or another port depending on your configuration).


### 🔧 Technologies Used

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **External APIs**: Google Gemini API, Ollama API (for intelligent responses)
- **File Handling**: Upload and download files directly in the chat
- **Web Scokets**: For effective Real-time Communication
