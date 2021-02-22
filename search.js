
const {Collection} = require('./collection');

class SearchCollection extends Collection {
    
    constructor(data) {
        super(data);
        this.page = 0;
    }

    async fetch(url) {
        let pageUrl = new PageURL(url);
        let doc = await super.fetch(url);
        let nodes = doc.querySelectorAll('.show-list > li');

        let results = [];
        for (let node of nodes) {
            let item = glib.DataItem.new();
            let elem = node.querySelector('.play-img');
            let link = elem.querySelector('img');

            item.link = pageUrl.href(elem.querySelector('a').attr('href'));
            item.title = link.attr('alt');
            item.picture = link.attr('src');
            item.subtitle = node.querySelector('.play-txt .fn-right').text.trim();
            results.push(item);
        }
        return results;
    }

    makeURL(page) {
        return this.url.replace('{0}', glib.Encoder.urlEncode(this.key)).replace('{1}', page + 1);
    }

    reload(data, cb) {
        this.key = data.get("key") || this.key;
        let page = data.get("page") || 0;
        if (!this.key) return false;
        this.fetch(this.makeURL(page)).then((results)=>{
            this.page = page;
            this.setData(results);
            cb.apply(null);
        }).catch(function(err) {
            if (err instanceof Error) 
                err = glib.Error.new(305, err.message);
            cb.apply(err);
        });
        return true;
    } 

    loadMore(cb) {
        let page = this.page + 1;
        this.fetch(this.makeURL(page)).then((results)=>{
            this.page = page;
            this.appendData(results);
            cb.apply(null);
        }).catch(function(err) {
            if (err instanceof Error) 
                err = glib.Error.new(305, err.message);
            cb.apply(err);
        });
        return true;
    }
}

module.exports = function(data) {
    return SearchCollection.new(data ? data.toObject() : {});
};