document.addEventListener("DOMContentLoaded", () => {
  const pinnedChatsContainer = document.getElementById("pinnedChats");
  const refreshBtn = document.getElementById("refreshBtn");

  const updatePinnedChatsList = (pinnedChats) => {
    pinnedChatsContainer.innerHTML = ""; // Clear existing list
    pinnedChats.forEach((chat) => {
      const listItem = document.createElement("div");
      listItem.className =
        "flex justify-between items-center bg-white p-2 rounded shadow";

      const chatName = document.createElement("span");
      chatName.textContent = chat.name;
      chatName.className = "text-sm text-gray-800";

      const unpinButton = document.createElement("button");
      unpinButton.textContent = "Unpin";
      unpinButton.className = "text-red-500 hover:text-red-700";
      unpinButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({
          action: "unpinChat",
          chatHref: chat.href,
        });
      });

      listItem.appendChild(chatName);
      listItem.appendChild(unpinButton);
      pinnedChatsContainer.appendChild(listItem);
    });
  };

  // Load initial pinned chats
  chrome.storage.local.get("pinnedChats", (result) => {
    updatePinnedChatsList(result.pinnedChats || []);
  });

  // Listen for updates from content.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updatePopup") {
      updatePinnedChatsList(request.pinnedChats);
    }
  });

  // Refresh button to reload pinned chats
  refreshBtn.addEventListener("click", () => {
    chrome.storage.local.get("pinnedChats", (result) => {
      updatePinnedChatsList(result.pinnedChats || []);
    });
  });
});
