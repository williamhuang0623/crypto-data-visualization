const cc = require("cryptocompare");
const sqlite3 = require("sqlite3").verbose();
const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./public/js/prsm.db"
    },
    useNullAsDefault: true
}).on("connection-error", (err)=> {
    console.log(err);
});
const $ = require("jquery");
const amd = require("amd-loader");

//Display Data directly from CoinMarketCap
function getDataDisplay(ticker, currency) {
    let data = cc.priceFull(ticker, currency);
    data.then(function(result) {

        //Specify JSON Data we want
        let price = result[ticker].USD.PRICE;
        let volume = result[ticker].USD.VOLUME24HOUR;
        let dayHigh = result[ticker].USD.HIGH24HOUR;
        let dayLow = result[ticker].USD.LOW24HOUR;
        let supply = result[ticker].USD.SUPPLY;
        let tck = result[ticker].USD.FROMSYMBOL;

        console.log(price, volume, dayHigh, dayLow, supply, tck);

    }).catch(function(err) {
        console.log(err);
    });
}
function displayAllData() {
    //To symbols
    let coinTickerArray = ["BTC", "ETH", "XRP", "BCH", "LTC", "EOS", "ADA", "XLM", "NEO", "IOT"];
    //Coin Symbols
    let currency = "USD";
    for (let i = 0; i < coinTickerArray.length; i++) {
        getDataDisplay(coinTickerArray[i], currency);
    }
}
// Using KnexJS
    //Create Table
function createPriceTable() {
    knex.schema.createTable('raw_prsm', function(table) {
        table.string("Ticker");
        table.float("Live_price");
        table.float("Supply");
        table.float("Volume");
        table.float("DayHigh");
        table.float("DayLow");
        table.timestamp('timestamp');
    }).then(function() {
        console.log("Raw_prsm built...");
        getAllData(callFromStorage());
    })
}

    //Storing Data into sqlite3 db
function storePriceData(tck, price, supply, volume, dayHigh, dayLow) {
    let time = new Date().getTime();
    knex('raw_prsm').insert({Ticker: tck, Live_price: price,
        Supply: supply, Volume: volume, DayHigh: dayHigh, DayLow: dayLow, timestamp: time}).then(function() {});
}
function getDataStore(ticker, currency) {
    let data = cc.priceFull(ticker, currency);
    data.then(function(result) {

        //Specify JSON Data we want
        let price = result[ticker].USD.PRICE;
        let volume = result[ticker].USD.VOLUME24HOUR;
        let dayHigh = result[ticker].USD.HIGH24HOUR;
        let dayLow = result[ticker].USD.LOW24HOUR;
        let supply = result[ticker].USD.SUPPLY;
        let tck = result[ticker].USD.FROMSYMBOL;

        //Input Values into DB
        console.log(tck, price, supply, volume, dayHigh, dayLow);
        storePriceData(tck, price, supply, volume, dayHigh, dayLow);
    }).catch(function(err) {
        console.log(err);
    });
}
function getAllData(callback) {
    let coinTickerArray = ["BTC", "ETH", "XRP", "BCH", "LTC", "EOS", "ADA", "XLM", "NEO", "IOT"];
    let currency = "USD";
    coinTickerArray.forEach(function(ticker) {
        getDataStore(ticker, currency);
    });
    if (callback) {
        callback();
    }
}

function callFromStorage() {
    let main = document.getElementById("container");
    main.innerHTML += "<p>Ticker | Price | Volume | Supply | Day High | Day Low | TimeStamp </p>";
    knex.select().table("raw_prsm").then((data)=> {
        for (let i = 0; i<data.length; i++) {
            let date = new Date(data[i]["timestamp"]);
            let row = "<p>" + data[i]["Ticker"] + "\t | " + data[i]["Live_price"] + "\t | " + data[i]["Volume"] + "\t | " + data[i]["Supply"] + "\t | " +
            data[i]["DayHigh"] + "\t | " + data[i]["DayLow"] + "\t | " + date + "\t | " + "</p>";
            main.innerHTML += row;
        }
    })
}
    //Displaying sqlite3 db in browser
function dataStoreDisplay() {
    let container = document.getElementById("container");
    if (container.innerHTML !== "") {
        container.innerHTML = "";
    }
    knex.schema.hasTable("raw_prsm").then(function (exists) {
        if (!exists) {
            createPriceTable();
        }
        else {
            getAllData(callFromStorage());
        }
    });
}

define(["crypto"], ()=> {
    let version = 1.0;
    return {
        knex: knex,
        getDataDisplay: getDataDisplay,
        amd: amd
    }
});
