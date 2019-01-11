const regression = require("regression");
const chartjs = require("chart.js/dist/Chart.bundle.min");
const $ = require("jquery");
const amd = require("amd-loader");
//const crypto = require("../public/js/crypto");

//Datasets
    //For supply/price scatter points
    let dataset = [];

    //For power regression
    let dataset3 = [];

    //For linear regression
    let dataset2 = [];

    //For easy traversing of min/max for plotting
    let priceset = [];

    //For comparing sets with Names
    let compareSetWithName = [];

//Methods
let loadDataset = (callback)=> {
    //Top 100 Coins
    let coinTickerArray = ["TRX", "NEO", "XMR", "DASH", "USDT",
        "XEM", "VEN", "BNB", "ETC", "ONT", "QTUM", "OMG", "BCN", "ICX", "ZEC", "ZIL", "LSK", "AE", "DCR", "BTG", "ZRX"];
        /*
        "SC", "BTM", "STEEM", "XVG", "BTS", "NANO", "MKR", "WAVES", "RHOC", "GNT", "WAN", "PPT", "DOGE", "REP", "BCD", "STRAT", "BTCP", "WTC", "DGB",
    "XIN", "IOST", "DGD", "SNT", "WICC", "HSR", "AION", "NAS", "LRC", "HT", "BAT", "ELF", "KMD", "ARK", "GXS", "ARDR", "ELA", "BNT",
    "CMT", "MAID", "PIVX", "MOAC", "SKY", "RDD", "GAS", "MONA", "CNX", "DCN", "CTXC", "KNC", "LOOM", "SYS", "ETHOS", "MITH", "POLY",
    "QASH", "FUN", "BIX", "FSN", "VERI", "THETA", "NULS", "ENG", "SUB", "ETN", "XZC", "NXT", "SOC", "DRGN", "DROP", "RDD"]; */

    if (dataset.length > 0) {
        //reset all data for each call
        dataset.length = 0; dataset2.length = 0; priceset.length = 0; compareSetWithName.length = 0;
    }
    coinTickerArray.forEach((ticker)=> {

        //Request HTTP
        let request = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + ticker + "&tsyms=USD";

        $.get(request, (data)=> {
            let price = data.RAW[ticker].USD.PRICE;
            let supply = data.RAW[ticker].USD.SUPPLY;

            // For Plotting (Blue Set)
            let dataPoint = {
                x: supply,
                y: price
            };

            //For comparing (overpriced/underpriced)
            let compareDataPoint = {
                ticker: ticker,
                x: supply,
                y: price
            };

            if (supply > 0) {
                dataset.push(dataPoint);
                dataset2.push([Math.log(supply), Math.log(price)]);
                priceset.push([supply,price]);
                compareSetWithName.push(compareDataPoint);
            } else {
                console.log(ticker + " has a supply of less than 0. Crypto-compare error.");
            }
        }).done(()=> {
            if (callback && dataset.length > Math.floor(coinTickerArray.length * .90)) {
                callback();
            }
        })
    });
};

let displayDataset = ()=> {

    //Get linear regression data for log values
    let powerData = regression.power(priceset);
    let linearData = regression.linear(dataset2);

    let linearA = Math.exp(linearData.equation[1]);
    let linearP = linearData.equation[0];

    console.log(powerData);

    //Regression Line equation: f(x) = a(x)^p //
    //x = log(price) y = log(supply)
    let a = powerData.equation[0];
    let p = powerData.equation[1];

    console.log(a + " ", p);

    //Generate new values for regression line
    let supplyList = [];
    for (let i=0; i<priceset.length; i++) {
        supplyList.push(priceset[i][0]);
    }

    //Find Max and Min of supplyList
    let max = Math.max(...supplyList);
    let min = Math.min(...supplyList);
    console.log("Max: " + max + " Min: " + min);

    dataset3 = [];

    dataset3.push({
        x: max,
        y: a * Math.pow(max, p)
    });
    dataset3.push({
        x: min,
        y: a * Math.pow(min, p)
    });

    let compareSet = [];
    for (let i=0; i<supplyList.length; i++) {
        let point = {
            x: supplyList[i],
            y: a * Math.pow(supplyList[i], p)
        }
        compareSet.push(point);
    }

    console.log(dataset3);

    compareSets(compareSetWithName, compareSet);
    /*
    // Linear Data equation
    for (let i=0; i<supplyList.length; i++) {
        let rPoint = {
            x: supplyList[i],
            y: linearA * Math.pow(supplyList[i], linearP)
        };
        dataset3.push(rPoint);
    }

    dataset3.push({
        x: max,
        y: linearA * Math.pow(max, linearP)
    });

    dataset3.push({
        x: min,
        y: linearA * Math.pow(min, linearP)
    });

    //Print to console for analysis
    console.log(dataset3);
    console.log(linearA + " " + linearP); */

    //Generate Chart
    if (dataset.length > 2) {
        let ctx = document.getElementById("chart");
        let myChart = new Chart(ctx, {

            type: "line",
            data: {
                datasets: [{
                    labels: [],
                    data: dataset,
                    pointBackgroundColor: "blue",
                    showLine: false
                }, {
                    data: dataset3,
                    pointBackgroundColor: "red",
                    fill: false,
                    showLine: true,
                    borderColor: "red",
                }]
            },
            options: {
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        type: "logarithmic",
                        position: "bottom",
                        scaleLabel: {
                            display: true,
                            labelString: "Log of Supply"
                        }
                    }],
                    yAxes: [{
                        type: "logarithmic",
                        position: "left",
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: "Log of Price"
                    },
                    }]

                },
                title: {
                    display: true,
                    text: "ChartJS Price vs Supply Log Scatter Plot - PRSM"
                },
                events: ["click"],
            }
        })
    }
};

//set1 has ticker name
let compareSets = (set1, set2)=> {

    if (set1.length !== set2.length) {
        console.log("The two sets are not equal in length, cannot compare.");
        return false;
    } else {
        for (let i=0; i<set1.length; i++) {
            let set1Y = set1[i]["y"];
            let set2Y = set2[i]["y"];

            if (set1Y == set2Y) {
                console.log("They are equal.")
            } else if (set2Y > set1Y) {
                console.log(set1[i]["ticker"] + " is undervalued. Supply is " + set1Y + " and supply from curve is " + set2Y);
            } else {
                console.log(set1[i]["ticker"] + " is overvalued. Supply is " + set1Y + " and supply from curve is " + set2Y);
            }
        }
    }
}



