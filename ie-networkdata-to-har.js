var fs = require('fs'),
    xml2js = require('xml2js');

function fixFloat(value, _default) {
    value = parseFloat(value);
    return isNaN(value) ? _default : value;
}

function fixInt(value, _default) {
    value = parseInt(value);
    return isNaN(value) ? _default : value;
}

function fix(har) {
    har.log.pages = har.log.pages.page;

    har.log.entries = har.log.entries.entry;

    var pageMap = {};

    har.log.pages.forEach((p, i) => {
        pageMap[p.id] = p;

        p.title = p.title || "Page " + i;

        for (k in p.pageTimings) {
            p.pageTimings[k] = fixFloat(p.pageTimings[k], -1);
        }
    });

    har.log.entries.forEach(e => {
        var p = pageMap[e.pageref];
        if (p) {
            // anchor page.startedDateTime to first entry for that page.
            p.startedDateTime = e.startedDateTime;
            delete pageMap[e.pageref];
        }

        e.time = fixFloat(e.time, 0);
        e.cache = e.cache || {};

        var t = e.timings;
        t.blocked = fixFloat(t.blocked, -1);
        t.dns = fixFloat(t.dns, -1);
        t.ssl = fixFloat(t.ssl, -1);
        t.connect = fixFloat(t.connect, -1);
        t.send = fixFloat(t.send, 0);
        t.wait = fixFloat(t.wait, 0);
        t.receive = fixFloat(t.receive, 0);

        var req = e.request;
        req.queryString = req.queryString.param || [];
        req.cookies = req.cookies.cookie || [];
        req.headers = req.headers.header || [];
        req.bodySize = fixInt(req.bodySize, -1);
        req.headersSize = fixInt(req.headersSize, -1);

        var res = e.response;
        res.status = fixInt(res.status, 0);
        res.redirectURL = res.redirectURL || "";
        res.cookies = res.cookies.cookie || [];
        res.headers = res.headers.header || [];
        res.content.size = fixInt(res.content.size, 0);
        res.bodySize = fixInt(res.bodySize, -1);
        res.headersSize = fixInt(res.headersSize, -1);
    });

    return har;
}

function xmlStrToHar(xmlStr, callback) {
    // https://github.com/Leonidas-from-XIV/node-xml2js#options
    var options = {
        explicitArray: false
    };
    var parser = new xml2js.Parser(options);
    parser.parseString(xmlStr, function(err, har) {
        if (err) {
            callback(err);
        } else {
            har = fix(har);
            callback(null, har);
        }
    });
}

function xmlFileToHar(src, callback) {
    fs.readFile(src, function(err, xmlStr) {
        if (err) {
            callback(err);
        } else {
            xmlStrToHar(xmlStr, callback);
        }
    });
}

function xmlFileToHarFile(src, dest, opts, callback) {
    if ("function" === typeof opts) {
        callback = opts;
        opts = {};
    }
    var indentation = opts.indentation || 2;
    xmlFileToHar(src, function(err, har) {
        fs.writeFile(dest, JSON.stringify(har, null, indentation), callback);
    });
}

module.exports = {
    xmlStrToHar: xmlStrToHar,
    xmlFileToHar: xmlFileToHar,
    xmlFileToHarFile: xmlFileToHarFile
};
