chrome.runtime.onInstalled.addListener(() => {
  console.log("Messenger Chat Pinner extension installed.");
});

// Example: Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "someAction") {
    // Handle the action
    console.log("Action received:", request.action);
    sendResponse({ status: "success" });
  }
});

// Ensure alarms permission is used correctly
chrome.alarms.create("periodicTask", { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "periodicTask") {
    console.log("Performing periodic task");
    // Perform the task
  }
});
