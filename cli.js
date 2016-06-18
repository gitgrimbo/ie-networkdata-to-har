var ie2har = require('./ie-networkdata-to-har');

var args = process.argv.slice(2);
var src = args[0];
var dest = args[1];
var indentation = parseInt(args[2]);
if (isNaN(indentation)) {
    indentation = 2;
}

console.log("src", src);
console.log("dest", dest);
console.log("indentation", indentation);

ie2har.xmlFileToHarFile(src, dest, { indentation: indentation }, function(err) {
    if (err) console.error(err);
});
