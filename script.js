// select the DOM element and assign them to variable.
const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

// variable declaretion.
let userText = null;
const initialHeight = chatInput.scrollHeight;
// collect the API credential and assign them to varible.
const API_URL = "https://api.openai.com/v1/completions";
const API_KEY = "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";

// load all data from local Storage.
const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `
    <div class="default-text">
        <h1>ChatGPT Clone</h1>
        <p>Start a conversation and explore the power of AI.<br>
        your chat history will be displayed here.
        </p>
    </div>`
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
}
// invoke the function of loadDataFromLocalStorage.
loadDataFromLocalStorage();

// create html chat div.
const createElement = (html, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
}
// declare the copy content functionality.
const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() =>  {
        copyBtn.textContent = "content_copy";
    }, 1000);
}
// shown the typing animation functionality.
const showTypingAnimation = () =>{
    const html = `
    <div class="chat-content">
        <div class="chat-details">
            <img src="./chatgpt-icon.webp" alt="system-img">
            <div class="typing-animation">
                <div class="typing-dot" style="--delay: .2s"></div> 
                <div class="typing-dot" style="--delay: .3s"></div> 
                <div class="typing-dot" style="--delay: .4s"></div> 
            </div>
        </div>
        <span id="copy-btn" class="material-symbols-rounded" onclick="copyResponse(this)">content_copy</span>
    </div>`

    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}
// API response functionality.
const getChatResponse = async (incomingChatDiv) => {
    
    const pElement = document.createElement("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null  
        })
    }

    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! somethink want wrong. please try again.";
    }

    incomingChatDiv?.querySelector(".typing-animation")?.remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
}
// handle outgoing chat functionality.
const handleOutgoingChat = () => {
    userText = chatInput.value.trim();

    if(!userText) return;  
    const html = `
    <div class="chat-content">
        <div class="chat-details">
            <img src="./user-img.png" alt="user-img">
            <p>${userText}</p>
        </div>
    </div>`

    const outgoingChatDiv = createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);

    getChatResponse();  //test purpose invoke this function.
}
// theme change event listener.
themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color",themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

// delete button click event listener.
deleteButton.addEventListener("click", () => {
    if(confirm("Are You Sure You Want to Delete all the Chat?")){
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
})
// chat input height control functionality.
chatInput.addEventListener("click", () => {
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
})

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftkey && window.innerWidth > 800){
        e.preventDefault();
        handleOutgoingChat();
    }
})
// sand button click event listener.
sendButton.addEventListener("click",handleOutgoingChat);