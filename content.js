function waitForChatsToLoad(callback) {
  console.log("Waiting for 'Chats' to load...");
  const checkInterval = setInterval(() => {
    const chatsElement = document.querySelector(
      'span[dir="auto"][style*="--lineHeight: 28px;"]'
    );
    if (chatsElement && chatsElement.textContent.includes("Chats")) {
      console.log("'Chats' loaded.");
      clearInterval(checkInterval);
      callback();
    }
  }, 100); // Check every 100ms
}

function processChats() {
  console.log("Starting processChats function");
  const processedChats = new Set();
  const chatLinksArray = [];

  // Attempt to find the chat list container dynamically
  const chatListContainer = document.querySelector('[role="grid"]');
  if (!chatListContainer) {
    console.error("Chat list container not found");
    return;
  }
  console.log("Chat list container found.");

  // Create a new container
  const newContainer = document.createElement("div");
  newContainer.style.padding = "10px";
  newContainer.style.backgroundColor = "#f0f0f0";
  newContainer.textContent = "This is a new container above the chat list";

  // Insert the new container above the chat list
  const parentElement = chatListContainer.parentNode;
  parentElement.parentNode.insertBefore(newContainer, parentElement);

  // Helper function to simulate chat selection
  const simulateChatSelection = (chatElement) => {
    console.log(`Simulating selection of chat: ${chatElement.href}`);

    // Simulate Messenger's click sequence
    ["mousedown", "mouseup", "click"].forEach((eventType) => {
      const event = new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      chatElement.dispatchEvent(event);
    });
  };

  const observer = new MutationObserver(() => {
    console.log("MutationObserver triggered");
    if (window.location.hostname === "www.messenger.com") {
      const chatLinks = document.querySelectorAll(
        'a[role="link"][href^="/e2ee/t/"]'
      );
      console.log("Found chat links:", chatLinks.length);

      chatLinks.forEach((link) => {
        const chatHref = link.getAttribute("href");
        if (!processedChats.has(chatHref)) {
          console.log("Processing chat:", chatHref);
          processedChats.add(chatHref);
          chatLinksArray.push(link);
        }
      });
    }
  });

  observer.observe(chatListContainer, {
    childList: true,
    subtree: true,
  });
  console.log("Observer started");

  // Click on a random chat every 5 seconds
  setInterval(() => {
    if (chatLinksArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * chatLinksArray.length);
      const randomChat = chatLinksArray[randomIndex];
      simulateChatSelection(randomChat);
    }
  }, 5000); // 5000 milliseconds = 5 seconds
}

console.log("Script loaded");
waitForChatsToLoad(processChats);
