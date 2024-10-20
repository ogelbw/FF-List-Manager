console.log("Content script loaded");

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received", request);
    if (request.action === "getURL") {
        sendResponse({url: window.location.href});
    }
});