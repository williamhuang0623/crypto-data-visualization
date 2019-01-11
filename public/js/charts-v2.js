const regression = require("regression");
const chartjs = require("chart.js/dist/Chart.bundle.min");
const $ = require("jquery");

let dataset = [];
let dataset2 = [];
let coinTickerArray = ["BTC", "ETH", "XRP", "BCH", "EOS", "LTC", "XLM", "ADA", "TRX", "NEO", "XMR", "DASH", "USDT",
    "XEM", "VEN", "BNB", "ETC", "ONT", "QTUM", "OMG", "BCN", "ICX", "ZEC", "ZIL", "LSK", "AE", "DCR", "BTG", "ZRX", "SC", "BTM"];

let loadDataset = (callback)=> {
    //Top 100 Coins
    /*
    "STEEM", "XVG", "BTS", "NANO", "MKR", "WAVES", "RHOC", "GNT", "WAN", "PPT", "DOGE", "REP", "BCD", "STRAT", "BTCP", "WTC", "DGB",
    "XIN", "IOST", "DGD", "SNT", "WICC", "HSR", "AION", "NAS", "LRC", "HT", "BAT", "ELF", "KMD", "ARK", "GXS", "ARDR", "ELA", "BNT",
    "CMT", "MAID", "PIVX", "MOAC", "SKY", "RDD", "GAS", "MONA", "CNX", "DCN", "CTXC", "KNC", "LOOM", "SYS", "ETHOS", "MITH", "POLY",
    "QASH", "FUN", "BIX", "FSN", "VERI", "THETA", "NULS", "ENG", "SUB", "ETN", "XZC", "NXT", "SOC", "DRGN", "DROP"]; */

    if (dataset.length > 0) {
        dataset.length = 0; dataset2.length = 0;
    }
    coinTickerArray.forEach((ticker)=> {
        let request = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + ticker + "&tsyms=USD";
        $.get(request, (data)=> {
            let price = data.RAW[ticker].USD.PRICE;
            let supply = data.RAW[ticker].USD.SUPPLY;

            let dataPoint = {
                label: ticker,
                x: Math.log(supply),
                y: Math.log(price)
            };

            let linearData = [Math.log(supply), Math.log(price)];

            dataset.push(dataPoint);
            dataset2.push(linearData);
        }).done(()=> {
            if (dataset.length == coinTickerArray.length) {
                if (callback) {
                    callback();
                }
            }
        })
    });
};

let displayDataset = ()=> {
    let linearData = regression.linear(dataset2);
    console.log(linearData);
    console.log(dataset2);

    if (dataset.length > 2) {
        let ctx = document.getElementById("chart");
        let myChart = new Chart(ctx, {
            type: "scatter",
            data: {
                datasets: [{
                    data: dataset,
                    pointBackgroundColor: "blue",
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: "linear",
                        position: "bottom"
                    }],
                    yAxes: [{
                        type: "linear",
                        position: "left"
                    }]

                },
                title: {
                    display: true,
                    text: "ChartJS Price vs Supply Log Scatter Plot - PRSM"
                },
                events: ["click"]
            }
        })
    }
}


