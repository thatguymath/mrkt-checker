const axios = require('axios');
const fs = require('fs');
const chalk = require('chalk');

function createArrayFromFile (fileNameWithExt) {
    // Read the file
    const data = fs.readFileSync(fileNameWithExt);

    // Parse the JSON data
    return JSON.parse(data);
}

function searchArray (array) {
    var proxyList = createArrayFromFile('proxies.json')

    var failedArray = []
    var workingProxiesArray = []

    var interval = 15000; // delay between two iterations in milliseconds / >35k avoids steam rate limit
    var promise = Promise.resolve();

    array.forEach((item, index) => {
      promise = promise.then(function () {

        var chosenProxy = proxyList[index % proxyList.length]
        var chosenProxyPair = `${chosenProxy.host}:${chosenProxy.port}`

        //console.log(chalk.white(`Starting... ${item} with Proxy ${chosenProxy.host}:${chosenProxy.port}`))

        axios.get(`https://steamcommunity.com/market/listings/440/${item.replace(/ /g, "%20")}/render?count=30&currency=7&country=US&format=json`, { proxy: chosenProxy} ).then(response => {
            if (!response.data.success) {
                failedArray.push(item)
                return console.log(chalk.magenta(`➥ FAILED ${item} with Proxy ${chosenProxyPair}`))
            }

            const listings = response.data.assets[440][2]

            for (const list in listings) {

                const filtered = listings[list].descriptions.filter( y => 
                    y.value.includes(' x ')
                );

                const sheen = listings[list].descriptions.filter( x => 
                    x.value.includes('(Sheen:')
                )

                var recipeArray = []
                for (var key in filtered) {
                    if (filtered.hasOwnProperty(key)) {
                        recipeArray.push(filtered[key].value); //Dynamic
                    }
                }

                if (!recipeArray[0].includes('Unique Killstreak Item x 1')) {
                    console.log(chalk.green(`|KS Found|  ${listings[list].name} ${listings[list].id} - https://steamcommunity.com/market/listings/440/${listings[list].name.replace(/ /g, "%20")}?filter=${sheen[0].value.toString().replace(/ /g, "+")}`))

                } else {
                    recipeArray.shift()

                    var recipeValue = recipeArray.filter(x => x.startsWith('Battle-Worn')).reduce((partialSum, a) => partialSum + parseInt(a.split(' x ')[1]), 0)

                    if(recipeValue < 18) {
                        console.log(chalk.green(`|PT Found|  ${listings[list].name} ${listings[list].id} - https://steamcommunity.com/market/listings/440/${listings[list].name.replace(/ /g, "%20")}?filter=${sheen[0].value.toString().replace(/ /g, "+")}`))
                    }

                }

            }

            console.log(chalk.blue(`✓ PASSED ${item} with Proxy ${chosenProxyPair}`))

            if (!workingProxiesArray.includes(`${chosenProxyPair}`)) {
                workingProxiesArray.push(chosenProxyPair)
                //console.log(chalk.yellow(`Current working proxies so far:\n${workingProxiesArray}`))
            }

        }).catch(error => {
            failedArray.push(`${item}`)
            console.log(chalk.red(`✗ FAILED ${item} with Proxy ${chosenProxyPair}`))
        });

        return new Promise(function (resolve) {
          setTimeout(resolve, interval);
        });
      });
    });
    
    promise.then(function () {
      console.log(chalk.white('Loop finished!\nRunning for failed items...'));
      if (failedArray.length > 0) {
        searchArray(failedArray)
      } else {
        console.log('Finished up!')
      }
    });
}

function steamProfit () {
/*     axios.all([
        axios.get(`https://steamcommunity.com/market/search/render/?appid=440&norender=1&sort_column=name&sort_dir=asc&count=100&start=0&query=Killstreak+Fabricator+NOT+Professional+NOT+Claidheamh`),
        axios.get(`https://steamcommunity.com/market/search/render/?appid=440&norender=1&sort_column=name&sort_dir=asc&count=100&start=100&query=Killstreak+Fabricator+NOT+Professional+NOT+Claidheamh`)
    ])
    .then(axios.spread((...responses) => {
        var fabs = []
        fabs = fabs.concat(responses[0].data.results, responses[1].data.results)

        var arr = []
        for (const fab in fabs) {
            arr.push(fabs[fab].name)
        }

        searchArray(arr)
    })); */    
}

searchArray(createArrayFromFile('items.json'))

//steamProfit();