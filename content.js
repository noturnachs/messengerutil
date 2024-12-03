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
  newContainer.style.backgroundColor = "#1f1f1f";
  newContainer.style.borderRadius = "8px";
  newContainer.style.marginBottom = "10px";
  newContainer.style.textAlign = "center";
  newContainer.style.fontFamily =
    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  newContainer.style.fontSize = "16px";
  newContainer.style.color = "#333";
  newContainer.style.minHeight = "100px"; // Set a fixed height
  newContainer.style.maxHeight = "800px"; // Set a fixed height
  newContainer.style.overflowY = "auto"; // Make it scrollable

  // Minimal scrollbar styling
  newContainer.style.scrollbarWidth = "thin"; // For Firefox
  newContainer.style.scrollbarColor = "#888 #f1f1f1"; // For Firefox

  // Add a title to the container
  const title = document.createElement("h2");
  title.style.margin = "0 0 10px 0"; // Add some margin below the title
  title.style.fontSize = "14px"; // Slightly larger font for the title
  title.style.color = "#ffffff"; // A different color for the title

  newContainer.appendChild(title);

  // Function to update the title with the count of pinned chats
  const updateTitle = () => {
    chrome.storage.local.get("pinnedChats", (result) => {
      const pinnedChats = result.pinnedChats || [];
      if (pinnedChats.length === 0) {
        title.textContent = "You have no pinned conversations";
      } else {
        title.textContent = `Pinned Conversations (${pinnedChats.length})`;
        newContainer.style.height = `${100 + pinnedChats.length * 50}px`; // Adjust height based on number of pinned chats
      }
    });
  };

  // Function to save pinned chats
  const savePinnedChats = (pinnedChats) => {
    chrome.storage.local.set({ pinnedChats }, () => {
      console.log("Pinned chats saved:", pinnedChats);
    });
  };

  // Insert the new container above the chat list
  const parentElement = chatListContainer.parentNode;
  parentElement.parentNode.insertBefore(newContainer, parentElement);

  // Function to style a chat link
  const styleChatLink = (link) => {
    link.style.display = "flex";
    link.style.alignItems = "center";
    link.style.justifyContent = "space-between";
    link.style.backgroundColor = "#262626"; // Dark background color
    link.style.color = "#fff"; // White text color
    link.style.padding = "10px";
    link.style.borderRadius = "8px";
    link.style.marginBottom = "5px";
    link.style.width = "auto"; // Ensure it doesn't collapse
    link.style.textDecoration = "none"; // Remove underline
  };

  // Modify the pin/unpin logic to use chrome.storage
  const createPinButton = (chatHref, isPinned, link) => {
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
      chrome.storage.local.get("pinnedChats", (result) => {
        const pinnedChats = result.pinnedChats || [];
        const targetSpan = link.querySelector(
          'span[style*="--lineHeight: 20px;"] > span'
        );
        let chatName = "Unknown";

        if (targetSpan) {
          chatName = targetSpan.textContent
            .split("<")[0]
            .trim()
            .replace(/,/g, "");
        }

        console.log(`Chat name: ${chatName}, Chat href: ${chatHref}`); // Log the chat name and href

        if (pinButton.textContent === "Pin") {
          pinButton.textContent = "Unpin";
          pinButton.style.backgroundColor = "#dc3545";
          pinnedChats.push({ href: chatHref, name: chatName });
          chrome.storage.local.set({ pinnedChats }, () => {
            console.log(`Pinned chat: ${chatName}`);
            console.log("Updated pinned chats:", JSON.stringify(pinnedChats));

            // Send message to popup
            // chrome.runtime.sendMessage({ action: "updatePopup", pinnedChats });

            const link = document.querySelector(`a[href="${chatHref}"]`);
            if (link) {
              const clonedLink = link.cloneNode(true);
              const button = clonedLink.querySelector("button");
              if (button) {
                button.remove();
              }

              clonedLink.removeAttribute("aria-current");
              styleChatLink(clonedLink);

              const unpinButton = createPinButton(chatHref, true, link);
              clonedLink.appendChild(unpinButton);

              clonedLink.addEventListener("click", (event) => {
                event.preventDefault();
                simulateChatSelection(link);
              });

              newContainer.appendChild(clonedLink);
            }
          });
        } else {
          pinButton.textContent = "Pin";
          pinButton.style.backgroundColor = "#007bff";
          const index = pinnedChats.findIndex((chat) => chat.href === chatHref);
          if (index > -1) {
            pinnedChats.splice(index, 1);
          }
          chrome.storage.local.set({ pinnedChats }, () => {
            console.log(`Unpinned chat: ${chatName}`);
            console.log("Updated pinned chats:", pinnedChats);

            // Send message to popup
            chrome.runtime.sendMessage({ action: "updatePopup", pinnedChats });

            const pinnedLink = newContainer.querySelector(
              `a[href="${chatHref}"]`
            );
            if (pinnedLink) {
              newContainer.removeChild(pinnedLink);
            }

            const originalLink = document.querySelector(
              `a[href="${chatHref}"]`
            );
            if (originalLink) {
              const originalButton = originalLink.querySelector("button");
              if (originalButton) {
                originalButton.textContent = "Pin";
                originalButton.style.backgroundColor = "#007bff";
              }
            }

            updateTitle();
          });
        }
      });
    });

    return pinButton;
  };

  // Load pinned chats from chrome.storage on page load
  const loadPinnedChats = () => {
    chrome.storage.local.get("pinnedChats", (result) => {
      const pinnedChats = result.pinnedChats || [];
      console.log("Loading pinned chats:", JSON.stringify(pinnedChats));

      pinnedChats.forEach((chat) => {
        const chatHref = chat.href; // Access the href property
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
            window.location.href = chatHref; // Navigate to the chat link
          }
        }
      });
      updateTitle(); // Update the title after loading
    });
  };

  // Load pinned chats initially with a delay to ensure DOM is ready
  setTimeout(loadPinnedChats, 1000);

  // Helper function to simulate chat selection
  const simulateChatSelection = (chatElement) => {
    console.log(`Simulating selection of chat: ${chatElement}`);

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

  const updateChatButtons = () => {
    chrome.storage.local.get("pinnedChats", (result) => {
      const pinnedChats = result.pinnedChats || [];

      // Selector for chat links
      const chatLinks = document.querySelectorAll(
        'a[role="link"][href^="/t/"]:not([aria-current="page"]), a[role="link"][href^="/e2ee/t/"]:not([aria-current="page"])'
      );

      console.log("chatLinks", chatLinks);

      chatLinks.forEach((link) => {
        const chatHref = link.getAttribute("href");

        // Selector for chat names
        const targetSpan = link.querySelector(
          'span[style*="--lineHeight: 20px;"] > span'
        );
        let chatName = "Unknown";

        if (targetSpan) {
          chatName = targetSpan.textContent
            .split("<")[0]
            .trim()
            .replace(/,/g, "");
        }

        console.log(`Chat name: ${chatName}, Chat href: ${chatHref}`);

        const isPinned = pinnedChats.some((chat) => chat.href === chatHref);
        let pinButton = link.querySelector("button");

        if (!pinButton) {
          pinButton = createPinButton(chatHref, isPinned, link);
          link.appendChild(pinButton);
        } else {
          pinButton.textContent = isPinned ? "Unpin" : "Pin";
          pinButton.style.backgroundColor = isPinned ? "#dc3545" : "#007bff";
        }
      });
    });
  };

  // Call updateChatButtons on page load
  updateChatButtons();

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
