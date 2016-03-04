var urlField;
var clipboardText;

// listener
document.addEventListener('DOMContentLoaded', Init, false);

// take action according the to replied action type from the background
// redirect to the given url
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var action = request.action;
        switch (action) {
            case "redirect":
                chrome.tabs.getSelected(null, function(tab) {
                    console.log("redirecting to " + request.url);
                    chrome.tabs.update(tab.id, {url: request.url}, function(tab) {
                        window.close();
                    });
                });
                break;
            case "clearUrlField":
                urlField.value = "";
                break;
        }
    }
);

// update urlField value and add listener to button
function Init() {
    urlField = document.getElementById('urlField');
    urlField.focus();
    document.execCommand('paste');
    clipboardText = urlField.value;
    
    document.getElementById("redirectButton").addEventListener("click", ParseAndRedirectFromInput, false);
    
    RequestRedirectUrl();
}

// notify background
function RequestRedirectUrl() {
    chrome.extension.sendRequest({clipboardText: clipboardText});
}

function ParseAndRedirectFromInput() {
    inputUrl = urlField.value;
    chrome.extension.sendRequest({url: inputUrl});
}