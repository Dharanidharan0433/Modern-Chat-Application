const chatBody = document.getElementById("chatBody");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");
const chatTitle = document.getElementById("chatTitle");
const searchInput = document.getElementById("searchInput");
const chatList = document.getElementById("chatList");
const newChatBtn = document.getElementById("newChatBtn");

let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentChatId = null;

/* ---------- INITIALIZE ---------- */
if (Object.keys(chats).length === 0) {
    createNewChat();
} else {
    currentChatId = Object.keys(chats)[0];
}

renderChatList();
loadChat();

/* ---------- EVENTS ---------- */
newChatBtn.addEventListener("click", createNewChat);
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
});

searchInput.addEventListener("input", searchMessages);

/* ---------- FUNCTIONS ---------- */

function createNewChat() {
    const id = "chat_" + Date.now();
    chats[id] = [];
    currentChatId = id;
    saveChats();
    renderChatList();
    loadChat();
}

function renderChatList() {
    chatList.innerHTML = "";

    Object.keys(chats).forEach((id, index) => {
        const li = document.createElement("li");
        li.className = id === currentChatId ? "active" : "";

        const title = document.createElement("span");
        title.textContent = "Chat " + (index + 1);
        title.style.flex = "1";

        title.addEventListener("click", () => {
            currentChatId = id;
            renderChatList();
            loadChat();
        });

        const del = document.createElement("span");
        del.textContent = "🗑️";
        del.className = "delete-chat";

        del.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("Delete this chat?")) {
                delete chats[id];
                currentChatId = Object.keys(chats)[0] || null;
                saveChats();
                renderChatList();
                loadChat();
            }
        });

        li.appendChild(title);
        li.appendChild(del);
        chatList.appendChild(li);
    });
}

function loadChat() {
    chatBody.innerHTML = "";
    searchInput.value = "";

    if (!currentChatId) {
        chatTitle.textContent = "No Chat";
        return;
    }

    chatTitle.textContent = "Chat";
    chats[currentChatId].forEach(m =>
        addMessage(m.user, m.text, m.type, m.time, m.status)
    );
}

function sendMessage() {
    if (!currentChatId) return;

    const text = messageInput.value.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const sentMsg = addMessage("Me", text, "sent", time, "✔");
    chats[currentChatId].push({ user: "Me", text, type: "sent", time, status: "✔" });
    messageInput.value = "";

    typingIndicator.style.display = "block";

    setTimeout(() => {
        typingIndicator.style.display = "none";
        sentMsg.querySelector(".status").textContent = "✔✔";

        const reply = `Nice 😊 I got your message: ${text}`;
        addMessage("Bot", reply, "received", time);
        chats[currentChatId].push({ user: "Bot", text: reply, type: "received", time });
        saveChats();
    }, 1000);

    saveChats();
}

function addMessage(user, text, type, time, status = "") {
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    msg.innerHTML = `
        <div class="username">${user}</div>
        <div>${text}</div>
        <div class="timestamp">
            ${time} ${status ? `<span class="status">${status}</span>` : ""}
        </div>
    `;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
}

function searchMessages() {
    const value = searchInput.value.toLowerCase();
    document.querySelectorAll(".message").forEach(msg => {
        msg.style.display = msg.textContent.toLowerCase().includes(value)
            ? "block"
            : "none";
    });
}

function saveChats() {
    localStorage.setItem("chats", JSON.stringify(chats));
}
