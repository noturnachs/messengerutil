function processChats() {
  const processedChats = new Set();

  const observer = new MutationObserver(() => {
    if (window.location.hostname === "www.messenger.com") {
      // Look for all chat links (including encrypted chats)
      const chatLinks = document.querySelectorAll(
        'a[href^="/t/"], a[href^="/e2ee/t/"]'
      );

      // Process chat links
      chatLinks.forEach((link) => {
        // Try different possible selectors for the name
        const chatName =
          link.querySelector('span[dir="auto"]')?.textContent || // First attempt
          link.querySelector('div[role="gridcell"] span')?.textContent; // Second attempt

        const chatHref = link.getAttribute("href");

        if (chatName && !processedChats.has(chatHref)) {
          processedChats.add(chatHref);
          console.log({
            type: "chat",
            name: chatName.trim(),
            href: chatHref,
          });
        }
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

processChats();
