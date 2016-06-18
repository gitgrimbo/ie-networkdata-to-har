This utility converts the IE `NetworkData.xml` files into standard HAR files.

# Things that get fixed

- The XML has extra named objects inside arrays.  E.g. `log.pages[].page.title`
instead of `log.pages[].title`.  These are removed.
- The XML sometimes doesn't have the `page.startedDateTime` matching the first
`entry.startedDateTime` for that page.  This results in some pages that have
their first entry many seconds or minutes after the page's start time, which
makes the HAR timeline unnecessarily elongated.
- The XML is often missing all the `timings` fields (`blocked`, `dns`, `ssl`,
`connect`, `send`, `wait`, `receive`).  These are added.

# Warnings

- IE sometimes exports multiple `<page>` elements with the same `page.id`.
You might want to take a look at the XML export and fix the ids if necessary.

# Sample code

````js
    var ie2har = require('./ie-networkdata-to-har');

    var args = process.argv.slice(2);
    var src = args[0];
    var dest = args[1];
    var indentation = parseInt(args[2]);
    if (isNaN(indentation)) {
        indentation = 2;
    }

    ie2har.xmlFileToHarFile(src, dest, { indentation: indentation }, function(err) {
        if (err) console.error(err);
    });
````
