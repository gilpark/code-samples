//code adapted from here: https://www.codepunker.com/blog/sync-audio-with-text-using-javascript
//subtitle printer
function convertVttToJson(vttString) {
    return new Promise((resolve, reject) => {
        var current = {}
        var sections = []
        var start = false;
        var vttArray = vttString.split('\n');
        vttArray.forEach((line, index) => {
            if(line.length === 1) return// this line for str
            if (line.replace(/<\/?[^>]+(>|$)/g, "") === " "){
            } else if (line.replace(/<\/?[^>]+(>|$)/g, "") == "") {
            } else if (line.indexOf('-->') !== -1 ) {
                start = true;
                if (current.start) {
                    sections.push(clone(current))
                }
                current = {
                    start: timeString2ms(line.split("-->")[0].trimRight().split(" ").pop()),
                    end: timeString2ms(line.split("-->")[1].trimLeft().split(" ").shift()),
                    part: ''
                }
            } else if (line.replace(/<\/?[^>]+(>|$)/g, "") === ""){
            } else if (line.replace(/<\/?[^>]+(>|$)/g, "") === " "){
            } else {
                if (start){
                    if (sections.length !== 0) {
                        if (sections[sections.length - 1].part.replace(/<\/?[^>]+(>|$)/g, "") === line.replace(/<\/?[^>]+(>|$)/g, "")) {
                        } else {
                            if (current.part.length === 0) {
                                current.part = line
                            } else {
                                current.part = `${current.part} ${line}`
                            }
                            // If it's the last line of the subtitles
                            if (index === vttArray.length - 1) {
                                sections.push(clone(current))
                            }
                        }
                    } else {
                        current.part = line
                        sections.push(clone(current))
                        current.part = ''
                    }
                }
            }
        })
        current = []
        sections.forEach(section => {
            section.part = section.part.replace(/<\/?[^>]+(>|$)/g, "")
        })
        resolve(sections);
    })
}

// helpers
//   http://codereview.stackexchange.com/questions/45335/milliseconds-to-time-string-time-string-to-milliseconds
function timeString2ms(a,b){// time(HH:MM:SS.mss) // optimized
    return a=a.split(','), // optimized
        b=a[1]*1||0, // optimized
        a=a[0].split(':'),
    b+(a[2]?a[0]*3600+a[1]*60+a[2]*1:a[1]?a[0]*60+a[1]*1:a[0]*1)*1e3 // optimized
}

function clone(obj) {
    if (null === obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

const audioSync = function (options) {
    const subtitles = document.getElementById(options.subtitlesContainer);
    const syncData = [];
    function createSubtitle(text) {
        convertVttToJson(text)
            .then((result) => {
                var x = 0;
                for (var i = 0; i < result.length; i++) { //cover for bug in vtt to json
                    if (result[i].part && result[i].part.trim() !== '') {
                        console.log("ok", result[i].part.length);
                        syncData[x] = result[i];
                        x++;
                    } else {
                        console.log("err", result[i].part.length);
                    }
                }
                console.log(syncData);
            });
    }

    function printSubtitle(currentTime) {
        syncData.forEach(function (element, index, array) {
            var el;
            if ((currentTime * 1000) >= element.start && (currentTime * 1000) <= element.end) {
                while (subtitles.hasChildNodes())
                    subtitles.removeChild(subtitles.firstChild);
                el = document.createElement('span');
                el.setAttribute("id", "c_" + index);
                el.innerText = syncData[index].part + "\n";
                subtitles.appendChild(el);
            }
        });
        if( subtitles.style.display === 'none')subtitles.style.display = '';
    }
    function clear() {
        subtitles.style.display = 'none';
        subtitles.innerHTML = '';
    }
    subtitles.style.display = 'none';
    return ({setText:createSubtitle, print:printSubtitle, clear:clear});
};
