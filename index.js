var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');



function downloadPage(url) {
    return new Promise((resolve, reject) => {
        request(url, function (error, response, body) {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            resolve(body);
    });
    });
}

async function myBackEndLogic() {
    var links = new Array();
    var page = 1;
    var hasNextPage = true;
    while (page < 2){ // hasNextPage
        try {
            const body = await downloadPage('https://winnicalidla.pl/alkohole-mocne.html?p=' + page)
            
            // console.log(html);
    
            var $ = cheerio.load(body);
            // fs.appendFileSync('body.html', body);
            
            
            hasNextPage = $('a.i-next').length > 0;

            // console.log($('li.col-lg-12').length)
            $('li.col-lg-12').each(function( index ) {
                var link = $(this).find('a').attr('href');
                // fs.appendFileSync('links.txt', link + '\n');
                links.push(link);
                //console.log(link);
            });

            console.log("Crawled page: " + page);
            page++;
    
        } catch (error) {
            console.error('ERROR:');
            console.error(error);
        }
    }
    // console.log(links)
    for (let link of links) {
        var re = /..(?=%'\;)/
        console.log(link)
        const body = await downloadPage(link)
        // fs.appendFileSync('body1.html', body);
        var $ = cheerio.load(body);
        var alcohol = $('div.alcohol ').find('style').html(); // find style of div.alcohol
        alcohol = alcohol.substr(alcohol.search(re), 2); // find regexp and get substring
        // var capacity = $('div.capacity').html();
        var price = $('div.price-info').after('br').first().text().match(/[0-9]+,[0-9]{2}/)[0];
        var subPrice = $('span.sub-price').html();
        console.log(alcohol);
        console.log(price);
        // console.log(subPrice);
        console.log(capacity.match(/[0-9]+/)[0]);
    }

}

// run your async function
myBackEndLogic();
