var request = require('request');
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


function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}


async function getProducts() {
    var links = new Array();
    var page = 1;
    var hasNextPage = true;
    while (hasNextPage) { // hasNextPage
        try {
            console.log("Getting products from page: " + page);
            const body = await downloadPage('https://winnicalidla.pl/alkohole-mocne.html?p=' + page)
            var $ = cheerio.load(body);
            hasNextPage = $('a.i-next').length > 0;

            $('li.col-lg-12').each(function (index) {
                var link = $(this).find('a').attr('href');
                links.push(link);
            });
            page++;
        } catch (error) {
            console.error('ERROR:');
            console.error(error);
        }
    }

    var products = [];

    for (let link of links) {
        var re = /[0-9,]+(?=%)/
        console.log("Processing " + link)
        const body = await downloadPage(link)
        var $ = cheerio.load(body);

        try {
            var alcohol = $('div.alcohol ').find('style').html(); // find style of div.alcohol
            alcohol = alcohol.substr(alcohol.search(re), 2).replace(',', '.'); // find regexp and get substring and replace ',' with '.'
            var price = $('div.price-info').after('br').first().text().match(/[0-9]+,[0-9]{2}/)[0].replace(',', '.');
            var name = $('h1.product-name').text();
        }
        catch (error) {
            console.error('ERROR:');
            console.error(error);
            continue;
        }
        var pricePer100g = parseFloat(price) * 10 / parseFloat(alcohol);
        var product = {};
        product.name = name;
        product.link = link;
        product.price = parseFloat(price);
        product.pricePer100g = parseFloat(pricePer100g.toFixed(2));
        products.push(product);
    }
    sortByKey(products, 'pricePer100g');
    return products;

}

result = getProducts()
