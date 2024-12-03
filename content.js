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

  // Create a new container for pinned conversations
  const newContainer = document.createElement("div");
  newContainer.style.padding = "20px";
  newContainer.style.backgroundColor = "#1a1a1a";
  newContainer.style.borderRadius = "8px";
  newContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  newContainer.style.marginBottom = "10px";
  newContainer.style.textAlign = "center";
  newContainer.style.fontFamily =
    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  newContainer.style.fontSize = "16px";
  newContainer.style.color = "#333";

  // Add a title to the container
  const title = document.createElement("h2");
  title.textContent = "Pinned Conversations";
  title.style.margin = "0 0 10px 0"; // Add some margin below the title
  title.style.fontSize = "18px"; // Slightly larger font for the title
  title.style.color = "#555"; // A different color for the title

  newContainer.appendChild(title);

  // Insert the new container above the chat list
  const parentElement = chatListContainer.parentNode;
  parentElement.parentNode.insertBefore(newContainer, parentElement);

  // Load pinned chats from localStorage on page load
  const loadPinnedChats = () => {
    for (let i = 0; i < localStorage.length; i++) {
      const chatHref = localStorage.key(i);
      if (localStorage.getItem(chatHref) === "pinned") {
        const link = document.querySelector(`a[href="${chatHref}"]`);
        if (link) {
          const clonedLink = link.cloneNode(true);
          const button = clonedLink.querySelector("button");
          if (button) {
            button.remove(); // Remove the button from the cloned link
          }

          clonedLink.style.backgroundColor = "#1e1e2f"; // Dark background color

          // Add click event to simulate chat selection
          clonedLink.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior
            simulateChatSelection(link); // Simulate the chat selection
          });

          newContainer.appendChild(clonedLink);
        }
      }
    }
  };

  // Load pinned chats initially
  loadPinnedChats();

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
        'a[role="link"][href^="/t/"]:not([aria-current="page"][aria-label="Chats"]), a[role="link"][href^="/e2ee/t/"]:not([aria-current="page"][aria-label="Chats"])'
      );
      console.log("Found chat links:", chatLinks.length);

      chatLinks.forEach((link) => {
        const chatHref = link.getAttribute("href");
        if (!processedChats.has(chatHref)) {
          console.log("Processing chat:", chatHref);
          processedChats.add(chatHref);
          chatLinksArray.push(link);

          // Add Pin/Unpin button
          const pinButton = document.createElement("button");
          pinButton.textContent =
            localStorage.getItem(chatHref) === "pinned" ? "Unpin" : "Pin";
          pinButton.style.marginLeft = "10px";
          pinButton.style.padding = "5px 10px";
          pinButton.style.border = "none";
          pinButton.style.borderRadius = "4px";
          pinButton.style.backgroundColor =
            pinButton.textContent === "Pin" ? "#007bff" : "#dc3545";
          pinButton.style.color = "#fff";
          pinButton.style.cursor = "pointer";

          pinButton.addEventListener("click", () => {
            if (pinButton.textContent === "Pin") {
              pinButton.textContent = "Unpin";
              pinButton.style.backgroundColor = "#dc3545"; // Change color to indicate unpin
              localStorage.setItem(chatHref, "pinned"); // Store pin status
              console.log(`Pinned chat: ${chatHref}`);

              // Move the chat link to the pinned container
              const clonedLink = link.cloneNode(true);
              const button = clonedLink.querySelector("button");
              if (button) {
                button.remove(); // Remove the button from the cloned link
              }

              // Style the cloned link
              clonedLink.style.display = "flex";
              clonedLink.style.alignItems = "center";
              clonedLink.style.justifyContent = "space-between";
              clonedLink.style.backgroundColor = "#1e1e2f"; // Dark background color
              clonedLink.style.color = "#fff"; // White text color
              clonedLink.style.padding = "10px";
              clonedLink.style.borderRadius = "8px";
              clonedLink.style.marginBottom = "5px";

              // Add click event to simulate chat selection
              clonedLink.addEventListener("click", (event) => {
                event.preventDefault(); // Prevent default link behavior
                simulateChatSelection(link); // Simulate the chat selection
              });

              newContainer.appendChild(clonedLink);
            } else {
              pinButton.textContent = "Pin";
              pinButton.style.backgroundColor = "#007bff"; // Change color back to pin
              localStorage.removeItem(chatHref); // Remove pin status
              console.log(`Unpinned chat: ${chatHref}`);

              // Remove the chat link from the pinned container
              const pinnedLink = newContainer.querySelector(
                `a[href="${chatHref}"]`
              );
              if (pinnedLink) {
                newContainer.removeChild(pinnedLink);
              }
            }
          });

          link.appendChild(pinButton);
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
