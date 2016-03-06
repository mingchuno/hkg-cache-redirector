var hkgcacheUrl = "https://plasticnofd.xyz/#/";
var isValidUrl = false;
var type, message, page;

// listener
// Note that the tab's URL may not be set at the time onActivated event fired
chrome.tabs.onActivated.addListener(UpdateShowStatus);
chrome.tabs.onUpdated.addListener(UpdateShowStatus);

// process the new url on extension icon clicked
chrome.extension.onRequest.addListener(
    function(request, sender) {
        chrome.tabs.getSelected(null,function(tab) {
            var givenUrl = request.url;
            var clipboardText = request.clipboardText;
            
            // always check the tab url first
            if(IsDomainHKGForum(tab.url)){
                var newUrl = GetHKGCacheUrlFromUrl(tab.url);
                console.log("newUrl=" + newUrl);
                chrome.runtime.sendMessage({action: "redirect", url: newUrl});
            }
            // work with any given url
            else if (typeof givenUrl != "undefined" && null != givenUrl) {
                if(IsDomainHKGForum(givenUrl)){
                    var newUrl = GetHKGCacheUrlFromUrl(givenUrl);
                    console.log("newUrl=" + givenUrl);
                    chrome.runtime.sendMessage({action: "redirect", url: newUrl});
                }
                else {
                    console.log("clearUrlField");
                    chrome.runtime.sendMessage({action: "clearUrlField"});    
                }
            }
            // work with the clipboard value
            else if (typeof clipboardText != "undefined" && null != clipboardText) {
                console.log("clipboardText=" + clipboardText);
                if(!IsDomainHKGForum(clipboardText)) {
                    console.log("clearUrlField");
                    chrome.runtime.sendMessage({action: "clearUrlField"});
                }
            }
            else {
                console.log("Unexpected error");
            }
        });
    }
)

// update extension show status
function UpdateShowStatus(activeInfo) {
    chrome.tabs.query({"active": true, "lastFocusedWindow": true},function(tabs) {
        if (typeof tabs != "undefined" && null != tabs) {
            if (tabs.length > 0) {
                chrome.pageAction.show(tabs[0].id);
            }
        }
    });
};

// reset value to default
function Init() {
    // so any error page will redirect to /BW/1
    type = "BW";
    message = "";
    page = "1";
}

// get the corrsponding HKGCache url from current url
function GetHKGCacheUrlFromUrl(url) {
    Init();
    AnalyseHKGDataFromUrl(url);
    // topic
    if (message == "") {
        return (hkgcacheUrl + "topics/" + type.toUpperCase() + "/" + page);
    }
    // post
    else {
        return (hkgcacheUrl + "post/" + message + "/" + page);
    }
}

// check if the url is a valid HKG url
function IsDomainHKGForum(url) {
    if(typeof url == "undefined" || null == url)
        url = window.location.href;
    var regex = /(m[0-9]+|forum[0-9]+|search)\.hkgolden\.com/;
    var match = url.match(regex);
    // confirm to be hkg forum
    if(typeof match != "undefined" && null != match) {
        return true;
    }
    return false;
}

// prepare the data for generating the url
// assumed that url is valid and domain is checked
function AnalyseHKGDataFromUrl(url) {
    var content = url.split(".com");
    if (typeof content != "undefined") {
        var data = content[1].split(/[\?\&]+/);
        if(typeof data != "undefined" && null != data) {
            data.forEach(AnalyseHKGData);
        }
    }
}

// for each type of data
function AnalyseHKGData(element, index, array) {
    var content = element.split("=");
    if (typeof content != "undefined" && content.length == 2) {
        switch(content[0]) {
            case "type":
                type = content[1];
                break;
            case "message":
                message = content[1];
                break;
            case "page":
                page = content[1];
                break;
        }
        //console.log("set " + content[0] + " to " + content[1]);
    }
}

// contextMenus
// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function() {
    console.log("onInstall");
    var context = ["page", "link"]
    var title = "View with HKGCache";
    chrome.contextMenus.create({title: title, contexts: context});
    
});

chrome.contextMenus.onClicked.addListener(function(info) {
    if (info.linkUrl) {
        console.log("linkUrl=" + info.linkUrl);
        url = info.linkUrl;
        if(IsDomainHKGForum(url)){
            chrome.tabs.create({url: GetHKGCacheUrlFromUrl(url), active: true});
        }
    }
    // try page
    else {
        console.log("pageUrl=" + info.pageUrl);
        url = info.pageUrl;
        if(IsDomainHKGForum(url)){
            chrome.tabs.getSelected(null, function(tab) {
                console.log("redirecting to " + url);
                chrome.tabs.update(tab.id, {url: GetHKGCacheUrlFromUrl(url)});
            });
        }
    }
    
});