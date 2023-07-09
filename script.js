const chatInput =document.querySelector("#chat-input");
const sendButton =document.querySelector("#send-btn");
const chatContainer =document.querySelector(".chat-container");
const deleteButton =document.querySelector("#delete-btn");
let userText = null;
const API_KEY = "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";
const initialHeight = chatInput.scrollHeight;

const loadDataFromLocalstorage = () => {

    const defaultText = `<div class="default-text">
                            <h1>TalkGPT</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your Chat History will be displayed here.</p>
                        </div>`

   chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText; 
   chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

loadDataFromLocalstorage();


const createElement = (html, className) => {
    //Create new div and apply chat, secified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv; //Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions ";
    const pElement = document.createElement("p");


    // Define the properties and data for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "content-Type":"application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            "model": "text-davinci-003",
            "prompt": userText,
            "max_tokens": 2048,
            "temperature": 0.2,
            "top_p": 1,
            "n": 1,
            "stop": null
        })

    }

    // Send POST request to API, get response and set the response as paragraph element text
    try{
        const response = await (await fetch(API_URL, requestOptions )).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch(error){
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    //Remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);

}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent)
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = ".material-symbols-rounded", 1000);
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/favicon.png" alt="user-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded"><i class='bx bxs-copy'></i></span>
                </div>`;

    //Create an incoming chat div with user's message & append it to chat container
    const incomingChatDiv = createElement (html,"incoming"); 
    chatContainer.appendChild(incomingChatDiv); 
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();//Get chatInput value and remove extra spaces 
    if(!userText) return; // If chatInput is empty return from here

    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/man.png" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    //Create an outgoing chat div with user's message & append it to chat container
    const outgoingChatDiv   = createElement (html,"ontgoing"); 
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);      
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalStorage function
    if(confirm("Are you sure you want to delete all the chats?")){
      localStorage.removeItem("all-chats");
      loadDataFromLocalstorage();  
    }
});



chatInput.addEventListener("input", () => {
    //Adjust the height of the input field dynamically based on its content 
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;

});

chatInput.addEventListener("keydown", (e) => {
    // If the enter key is pressed without shift and the window width is larger
    // than 800 pixels, handle the outgoing chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }

});

sendButton.addEventListener("click", handleOutgoingChat);