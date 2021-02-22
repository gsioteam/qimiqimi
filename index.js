
const {Collection} = require('./collection');

class HomeCollection extends Collection {

    reload(_, cb) {
        let pageUrl = new PageURL(this.url);
        this.fetch(this.url).then((doc)=>{
            let titles = doc.querySelectorAll('.latest-tab-nav > ul > li');
            let cols = doc.querySelectorAll('.latest-tab-box .latest-item');
            let len = titles.length;

            let items = [];
            for (let i = 0; i < len; ++i) {
                let telem = titles[i];
                let item = glib.DataItem.new();
                item.type = glib.DataItem.Type.Header;
                item.title = telem.text;
                items.push(item);

                let celem = cols[i];
                let list = celem.querySelectorAll('.img-list > li');
                for (let node of list) {
                    let link = node.querySelector('a.play-img');
                    let img = link.querySelector('img');
                    let item = glib.DataItem.new();
                    item.title = link.attr('title');
                    item.link = pageUrl.href(link.attr('href'));
                    item.picture = img.attr('src');
                    item.subtitle = node.querySelector('.time').text;
                    items.push(item);
                }
            }
            this.setData(items);
            cb.apply(null);
        }).catch((err)=>{
            if (err instanceof Error) {
                console.log("Err " + err.message + " stack " + err.stack);
                err = glib.Error.new(305, err.message);
            }
            cb.apply(err);
        });
        return true;
    }
}

class CategoryCollection extends Collection {

    constructor(data) {
        super(data);
        this.page = 0;
    }

    async fetch(url) {
        let pageUrl = new PageURL(url);

        let doc = await super.fetch(url);
        let elems = doc.querySelectorAll('.img-list > li > a');

        let results = [];

        for (let i = 0, t = elems.length; i < t; ++i) {
            let elem = elems[i];

            let item = glib.DataItem.new();

            item.title = elem.attr('title');
            item.link = pageUrl.href(elem.attr('href'));
            let img = elem.querySelector('img');
            item.picture = pageUrl.href(img.attr('src'));
            item.subtitle = elem.querySelector('p').text.trim();
            results.push(item);
        }
        return results;
    }

    makeURL(page) {
        return this.url.replace('{0}', page + 1);
    }

    reload(_, cb) {
        let page = 0;
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

module.exports = function(info) {
    let data = info.toObject();
    if (data.id === 'home') 
        return HomeCollection.new(data);
    else return CategoryCollection.new(data);
};
