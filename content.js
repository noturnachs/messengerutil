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
  newContainer.style.backgroundColor = "#ffffff";
  newContainer.style.borderRadius = "8px";
  newContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  newContainer.style.marginBottom = "10px";
  newContainer.style.textAlign = "center";
  newContainer.style.fontFamily =
    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  newContainer.style.fontSize = "16px";
  newContainer.style.color = "#333";
  newContainer.style.height = "800px"; // Set a fixed height
  newContainer.style.overflowY = "auto"; // Make it scrollable

  // Minimal scrollbar styling
  newContainer.style.scrollbarWidth = "thin"; // For Firefox
  newContainer.style.scrollbarColor = "#888 #f1f1f1"; // For Firefox

  // Add a title to the container
  const title = document.createElement("h2");
  title.style.margin = "0 0 10px 0"; // Add some margin below the title
  title.style.fontSize = "18px"; // Slightly larger font for the title
  title.style.color = "#555"; // A different color for the title

  newContainer.appendChild(title);

  // Function to update the title with the count of pinned chats
  const updateTitle = () => {
    const pinnedChats = JSON.parse(localStorage.getItem("pinnedChats") || "[]");
    title.textContent = `Pinned Conversations (${pinnedChats.length})`;
  };

  // Insert the new container above the chat list
  const parentElement = chatListContainer.parentNode;
  parentElement.parentNode.insertBefore(newContainer, parentElement);

  // Function to style a chat link
  const styleChatLink = (link) => {
    link.style.display = "flex";
    link.style.alignItems = "center";
    link.style.justifyContent = "space-between";
    link.style.backgroundColor = "#1e1e2f"; // Dark background color
    link.style.color = "#fff"; // White text color
    link.style.padding = "10px";
    link.style.borderRadius = "8px";
    link.style.marginBottom = "5px";
    link.style.width = "auto"; // Ensure it doesn't collapse
    link.style.textDecoration = "none"; // Remove underline
  };

  // Function to create a pin/unpin button
  const createPinButton = (chatHref, isPinned) => {
    const pinButton = document.createElement("button");
    pinButton.textContent = isPinned ? "Unpin" : "Pin";
    pinButton.style.marginLeft = "10px";
    pinButton.style.padding = "5px 10px";
    pinButton.style.border = "none";
    pinButton.style.borderRadius = "4px";
    pinButton.style.backgroundColor = isPinned ? "#dc3545" : "#007bff";
    pinButton.style.color = "#fff";
    pinButton.style.cursor = "pointer";

    pinButton.addEventListener("click", () => {
      const pinnedChats = JSON.parse(
        localStorage.getItem("pinnedChats") || "[]"
      );
      if (pinButton.textContent === "Pin") {
        pinButton.textContent = "Unpin";
        pinButton.style.backgroundColor = "#dc3545"; // Change color to indicate unpin
        pinnedChats.push(chatHref);
        localStorage.setItem("pinnedChats", JSON.stringify(pinnedChats));
        console.log(`Pinned chat: ${chatHref}`);
        console.log("Updated pinned chats:", pinnedChats);

        // Clone and append the chat link to the pinned container
        const link = document.querySelector(`a[href="${chatHref}"]`);
        if (link) {
          const clonedLink = link.cloneNode(true);
          const button = clonedLink.querySelector("button");
          if (button) {
            button.remove(); // Remove the button from the cloned link
          }

          // Style the cloned link
          styleChatLink(clonedLink);

          // Add the unpin button
          const unpinButton = createPinButton(chatHref, true);
          clonedLink.appendChild(unpinButton);

          // Add click event to simulate chat selection
          clonedLink.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior
            simulateChatSelection(link); // Simulate the chat selection
          });

          newContainer.appendChild(clonedLink);
        }
      } else {
        pinButton.textContent = "Pin";
        pinButton.style.backgroundColor = "#007bff"; // Change color back to pin
        const index = pinnedChats.indexOf(chatHref);
        if (index > -1) {
          pinnedChats.splice(index, 1);
        }
        localStorage.setItem("pinnedChats", JSON.stringify(pinnedChats));
        console.log(`Unpinned chat: ${chatHref}`);
        console.log("Updated pinned chats:", pinnedChats);

        // Remove the chat link from the pinned container
        const pinnedLink = newContainer.querySelector(`a[href="${chatHref}"]`);
        if (pinnedLink) {
          newContainer.removeChild(pinnedLink);
        }

        // Update the button in the chat list
        const originalLink = document.querySelector(`a[href="${chatHref}"]`);
        if (originalLink) {
          const originalButton = originalLink.querySelector("button");
          if (originalButton) {
            originalButton.textContent = "Pin";
            originalButton.style.backgroundColor = "#007bff";
          }
        }
      }
      updateTitle(); // Update the title after pin/unpin
    });

    return pinButton;
  };

  // Load pinned chats from localStorage on page load
  const loadPinnedChats = () => {
    const pinnedChats = JSON.parse(localStorage.getItem("pinnedChats") || "[]");
    console.log("Loading pinned chats:", pinnedChats);

    pinnedChats.forEach((chatHref) => {
      if (chatHref) {
        // Check if href is not blank
        const link = document.querySelector(`a[href="${chatHref}"]`);
        if (link) {
          const clonedLink = link.cloneNode(true);
          const button = clonedLink.querySelector("button");
          if (button) {
            button.remove(); // Remove the button from the cloned link
          }

          // Style the cloned link
          styleChatLink(clonedLink);

          // Add the unpin button
          const unpinButton = createPinButton(chatHref, true);
          clonedLink.appendChild(unpinButton);

          // Add click event to simulate chat selection
          clonedLink.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior
            simulateChatSelection(link); // Simulate the chat selection
          });

          newContainer.appendChild(clonedLink);
        } else {
          console.log(`Chat link not found for: ${chatHref}`);
        }
      }
    });
    updateTitle(); // Update the title after loading
  };

  // Load pinned chats initially with a delay to ensure DOM is ready
  setTimeout(loadPinnedChats, 1000);

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
        if (chatHref && !processedChats.has(chatHref)) {
          // Check if href is not blank
          console.log("Processing chat:", chatHref);
          processedChats.add(chatHref);
          chatLinksArray.push(link);

          // Add Pin/Unpin button
          const pinnedChats = JSON.parse(
            localStorage.getItem("pinnedChats") || "[]"
          );
          const pinButton = createPinButton(
            chatHref,
            pinnedChats.includes(chatHref)
          );
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

  // Add CSS for WebKit browsers
  const style = document.createElement("style");
  style.textContent = `
    div::-webkit-scrollbar {
      width: 6px;
    }
  
    div::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }
    div::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `;
  document.head.appendChild(style);
}

console.log("Script loaded");
waitForChatsToLoad(processChats);
