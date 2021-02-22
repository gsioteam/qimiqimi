
const {Collection} = require('./collection');

class DetailsCollection extends Collection {
    
    async fetch(url) {
        console.log(url);
        let pageUrl = new PageURL(url);
        let doc = await super.fetch(url);

        let info_data = this.info_data;
        info_data.summary = doc.querySelector('.juqing').text;

        let boxes = doc.querySelectorAll('.ui-box.marg');
        let items = [];
        for (let box of boxes) {
            let id = box.attr('id');
            if (typeof id === 'string') {
                if (id.match(/^playlist_/)) {
                    let title = box.querySelector('.down-title h2').text.trim();

                    let list = box.querySelectorAll('.video_list a');
                    for (let node of list) {
                        let item = glib.DataItem.new();
                        item.title = node.text;
                        item.link = pageUrl.href(node.attr('href'));
                        item.subtitle = title;
                        items.push(item);
                    }
                }
            }
        }

        return items;
    }

    reload(_, cb) {
        this.fetch(this.url).then((results)=>{
            this.setData(results);
            cb.apply(null);
        }).catch(function(err) {
            if (err instanceof Error) 
                err = glib.Error.new(305, err.message);
            cb.apply(err);
        });
        return true;
    }
}

module.exports = function(item) {
    return DetailsCollection.new(item);
};