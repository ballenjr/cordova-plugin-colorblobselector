/* global cordova, plugin, CSSPrimitiveValue */
var PLUGIN_NAME = 'ColorBlobPlugin';
var exec = require('cordova/exec');

function clearBodyBackground() {
    var css = 'body { background: transparent !important; height: 100vh; width: 100vw; margin: 0; overflow: hidden; }',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.type = 'text/css';
    style.classList.add('temporary-translucent-body');
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
}

function dropBodyTransparency() {
    var head = document.head || document.getElementsByTagName('head')[0];
    head.removeChild(head.getElementsByClassName("temporary-translucent-body")[0]);
}

var elementsToTrack = [];

function nodeInsertedHandler(e) {
    e = e.target || e;
    if (!!e.offsetParent) {
        elementsToTrack.push(e);
        var r = e.getClientRects()[0];
        exec(function(){},function(){},PLUGIN_NAME,
            'trackbox', [r.left, r.top, r.width, r.height]);
    }
}

function nodeRemovedHandler(e, done) {
    e = e.target || e;
    var idx = elementsToTrack.indexOf(e);
    if (idx > -1)
        exec(function(){
            elementsToTrack.splice(idx, 1);
            if (!!done) done();
        }, function(){}, PLUGIN_NAME, 'untrackbox', [idx])
}

var observer = new MutationObserver(function(mutations) {
    for(var m in mutations) {
        var target = mutations[m].target;
        if (mutations[m].attributeName == "style" || 
            mutations[m].attributeName == "class") {
            var style = getComputedStyle(target);
            if (style.getPropertyValue("display") == "none" ||
                style.getPropertyValue("visibility") == "hidden" ||
                style.getPropertyValue("opacity") == "0")
                nodeRemovedHandler(target);
            else if (elementsToTrack.indexOf(target) == -1)
                nodeInsertedHandler(target);
            else
                nodeRemovedHandler(target, function() {
                    nodeInsertedHandler(target);
                });
        }
    }
});

function startTracking() {
    document.addEventListener("DOMNodeRemoved", nodeRemovedHandler);
    document.addEventListener("DOMNodeInserted", nodeInsertedHandler);
    observer.observe(document.body, { subtree: true, attributes: true });
    var all = document.querySelectorAll("*");
    all.forEach(nodeInsertedHandler);
}

window.addEventListener("resize", function(){
    if (!!elementsToTrack.length) {
        var list = [];
        for(var i in elementsToTrack)
            list.push(elementsToTrack[i]);
        stopTrackingAll(function() {
            for(var i in list)
                nodeInsertedHandler(list[i]);
        });
    }
});

function stopTrackingAll(done) {
    exec(function(){
        elementsToTrack = [];
        observer.disconnect();
        if (!!done) done();
    },function(){},
        PLUGIN_NAME,"untrackall",[]);
}

var isShowing = false;

function show(success, error) {
    var self = this;
    if (!!elementsToTrack.length || isShowing)
        return console.error("You can only show one selector at a time.");
    clearBodyBackground();
    exec(function(result) {
        isShowing = true;
        if (!!success) success.call(this, [result]);
    }, function(err) {
        dropBodyTransparency();
        if (!!error) error.call(this, [err]);
    }, PLUGIN_NAME, 'show', []);
    startTracking();
}

function close(success, error) {
    var self = this;
    exec(function(result) {
        if (!!success) success.call(this, [result]);
        isShowing = false;
        dropBodyTransparency();
        stopTrackingAll();
    }, function(err) {
        if (!!error) error.call(this, [err])
    }, PLUGIN_NAME, 'close', []);
}

function getDataURL(success, error) {
    exec(success, error, PLUGIN_NAME, "getDataURL", []);
}

function getDescriptors(success, error) {
    exec(success, error, PLUGIN_NAME, "getDescriptors", []);
}

function setMaxFeaturesToDetect(num) {
    exec(function(){},function(){},PLUGIN_NAME,"setMaxFeaturesToDetect",[num])
}

function setMaxColors(num) {
    exec(function(){},function(){},PLUGIN_NAME,"setMaxColors",[num])
}

function setSnapShot() {
    exec(function(){},function(){},PLUGIN_NAME,"setSnapShot",[])
}

function clearSnapShot() {
    exec(function(){},function(){},PLUGIN_NAME,"clearSnapShot",[])
}

function resetSelection() {
    exec(function(){},function(){},PLUGIN_NAME,"resetSelection",[])
}

function setSelectionColor(red, green, blue) {
    exec(function(){},function(){},PLUGIN_NAME,"setSelectionColor",[red,green,blue])
}

function setColorRadius(hue, saturation, value) {
    exec(function(){},function(){},PLUGIN_NAME,"setColorRadius",[hue,saturation,value])
}

document.querySelectorAll("button")[0].addEventListener("click", function() {
    setSnapShot(function(data) {
        console.log(data);
    }, function(err) {
        console.error(err);
    });
});

module.exports = {
    show: show,
    close: close,
    getDataURL: getDataURL,
    setSnapShot: setSnapShot,
    setMaxColors: setMaxColors,
    setColorRadius: setColorRadius,
    resetSelection: resetSelection,
    getDescriptors: getDescriptors,
    setSelectionColor: setSelectionColor,
    setMaxFeaturesToDetect: setMaxFeaturesToDetect
}