document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("pinnedChats", (result) => {
    const pinnedChats = result.pinnedChats || [];
    const list = document.getElementById("pinnedChatsList");

    pinnedChats.forEach((chatHref) => {
      const listItem = document.createElement("li");
      listItem.textContent = chatHref;

      const unpinButton = document.createElement("button");
      unpinButton.textContent = "Unpin";
      unpinButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "unpinChat", chatHref });
      });

      listItem.appendChild(unpinButton);
      list.appendChild(listItem);
    });
  });
});
