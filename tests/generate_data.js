// Generate a large sample note for benchmark tests

var Note = require('../Note.js'),
    fs = require('fs')

var a  = new Note({"kind": "Listing", "data": {"modhash": "", "children": [{"kind": "t3", "data": {"domain": "neatorama.cachefly.net", "banned_by": null, "media_embed": {}, "subreddit": "pics", "selftext_html": null, "selftext": "", "likes": null, "link_flair_text": null, "id": "7fekt", "clicked": false, "title": "A list of average IQ's per occupation", "num_comments": 782, "score": 833, "approved_by": null, "over_18": false, "hidden": false, "thumbnail": "http://thumbs.reddit.com/t3_7fekt.png", "subreddit_id": "t5_2qh0u", "edited": false, "link_flair_css_class": null, "author_flair_css_class": null, "downs": 414, "saved": false, "is_self": false, "permalink": "/r/pics/comments/7fekt/a_list_of_average_iqs_per_occupation/", "name": "t3_7fekt", "created": 1227556614.0, "url": "http://neatorama.cachefly.net/images/2007-08/iq-range-occupations.jpg", "author_flair_text": null, "author": "vasant56", "created_utc": 1227556614.0, "media": null, "num_reports": null, "ups": 1247}}, {"kind": "t3", "data": {"domain": "neatorama.cachefly.net", "banned_by": null, "media_embed": {}, "subreddit": "offbeat", "selftext_html": null, "selftext": "", "likes": null, "link_flair_text": null, "id": "7fsf9", "clicked": false, "title": "A list of average IQ's per occupation", "num_comments": 0, "score": 0, "approved_by": null, "over_18": false, "hidden": false, "thumbnail": "", "subreddit_id": "t5_2qh11", "edited": false, "link_flair_css_class": null, "author_flair_css_class": null, "downs": 2, "saved": false, "is_self": false, "permalink": "/r/offbeat/comments/7fsf9/a_list_of_average_iqs_per_occupation/", "name": "t3_7fsf9", "created": 1227701543.0, "url": "http://neatorama.cachefly.net/images/2007-08/iq-range-occupations.jpg", "author_flair_text": null, "author": "lovemorgul", "created_utc": 1227701543.0, "media": null, "num_reports": null, "ups": 2}}], "after": null, "before": null}})

var out = new Note()
for (var i = 1; i < 2000; i++) {
    out[i] = a.clone()
}

fs.writeFileSync('big.note', out.toString(), 'utf8')
