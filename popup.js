// Global variable to store pinned chats
let pinnedChats = [];

// Initialize when popup loads
document.addEventListener("DOMContentLoaded", () => {
  loadPinnedChats();
  setupEventListeners();
});

// Load pinned chats from storage
function loadPinnedChats() {
  chrome.storage.local.get(["pinnedChats"], (result) => {
    pinnedChats = result.pinnedChats || [];
    updatePinnedChatsList();
  });
}

// Set up event listeners
function setupEventListeners() {
  // Refresh button handler
  document.getElementById("refreshBtn").addEventListener("click", async () => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const currentTab = tabs[0];

      // Check if we're on messenger.com
      if (currentTab?.url?.includes("messenger.com")) {
        // Check if content script is ready
        try {
          // First try to ping the content script
          await chrome.tabs.sendMessage(currentTab.id, { action: "ping" });
          // If successful, send the refresh message
          await chrome.tabs.sendMessage(currentTab.id, { action: "refresh" });
        } catch (err) {
          // Content script not ready or not injected
          const container = document.getElementById("pinnedChats");
          container.innerHTML =
            '<div class="text-red-500 text-center p-2">Please refresh the Messenger page</div>';
        }
      } else {
        // Show error message in the popup
        const container = document.getElementById("pinnedChats");
        container.innerHTML =
          '<div class="text-red-500 text-center p-2">Please open Messenger to use this extension</div>';
      }
    } catch (err) {
      console.log("Error:", err);
    }
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.pinnedChats) {
      pinnedChats = changes.pinnedChats.newValue || [];
      updatePinnedChatsList();
    }
  });
}

// Update the UI with pinned chats
function updatePinnedChatsList() {
  const container = document.getElementById("pinnedChats");
  container.innerHTML = "";

  if (pinnedChats.length === 0) {
    container.innerHTML =
      '<div class="text-gray-500 text-center p-2">No pinned chats</div>';
    return;
  }

  pinnedChats.forEach((chatId) => {
    const chatElement = document.createElement("div");
    chatElement.className =
      "flex justify-between items-center p-2 bg-white rounded shadow mb-2";

    // Extract chat name from URL if possible
    const chatName = chatId.split("/").pop() || chatId;

    chatElement.innerHTML = `
      <span class="truncate flex-grow" title="${chatId}">${chatName}</span>
      <button class="unpin-btn text-red-500 hover:text-red-700 ml-2 px-2" data-chat-id="${chatId}">
        Unpin
      </button>
    `;

    // Add unpin button handler
    const unpinBtn = chatElement.querySelector(".unpin-btn");
    unpinBtn.addEventListener("click", () => unpinChat(chatId));

    container.appendChild(chatElement);
  });
}

// Handle unpinning a chat
function unpinChat(chatId) {
  pinnedChats = pinnedChats.filter((id) => id !== chatId);

  // Save to storage
  chrome.storage.local.set({ pinnedChats }, () => {
    // Notify content script to update
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url?.includes("messenger.com")) {
        chrome.tabs
          .sendMessage(tabs[0].id, { action: "refresh" })
          .catch((err) => {
            console.log("Failed to send message to content script:", err);
          });
      }
    });
    // Update popup UI
    updatePinnedChatsList();
  });
}
