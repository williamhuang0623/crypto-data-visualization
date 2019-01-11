const $ = require("jquery");
const crypto = require("../public/js/crypto");

// redefine imported table connection
knex = crypto.knex;
function createValueTable(callback) {
    knex.schema.createTable("input_values", (table)=> {
        table.string("Ticker");
        table.integer("Technology");
        table.integer("Maturity");
        table.integer("Branding");
        table.integer("Exchange");
        table.timestamp("timestamp");
    }).then(()=> {
        if (callback) {
            callback();
        }
    })
}

let updateCryptoValues = (ticker, technology, maturity, branding, exchange)=> {

    knex.schema.hasTable("input_values").then((exists)=> {
        if (!exists) {
            createValueTable(updateCryptoValues(ticker, technology, maturity, branding, exchange));
        } else {
            knex("input_values").count("Ticker").where("Ticker", ticker).then((num)=> {
                let parsedNum = num[0]['count(`Ticker`)'];

                //put new timestamp everytime there is an update
                let newDate = new Date();

                if (parsedNum == 0) {
                    knex("input_values").insert({
                        Ticker: ticker,
                        Technology: parseInt(technology),
                        Maturity: parseInt(maturity),
                        Branding: parseInt(branding),
                        Exchange: parseInt(exchange),
                        timestamp: newDate
                    }).then(()=> {
                        console.log("Inserted " + ticker)
                    })
                }
                else {
                    knex("input_values").where("Ticker", ticker).update({
                        Technology: parseInt(technology),
                        Maturity: parseInt(maturity),
                        Branding: parseInt(branding),
                        Exchange: parseInt(exchange),
                        timestamp: newDate
                    }).then(()=> {
                        console.log("Updated " + ticker);
                    })
                }
            });

        }
    })
};
