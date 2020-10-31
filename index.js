const fs = require('fs');
const WebSocket = require('ws');

const ws = new WebSocket.Server({ port: 8080 });

let Network = require('../AI.JS/index.js').AI;

let progress = [];

let AI = new Network({
    "schema": [25, 50, 50, 25, 10],
    "activationFunction": (z) => 1 / (1 + (Math.E ** - z)),
    "learningRate": 0.0001
});

fs.readFile('weights.json', 'utf-8', (err, data) => {
    if (err) {

    } else {
        if (data) {
            if (data != "" && data != "[]") {
                AI.weights = JSON.parse(data);
            }
        }
    }
})

fs.readFile('progress.json', 'utf-8', (err, data) => {
    if (err) {

    } else {
        if (data) {
            if (data != "" && data != "[]") {
                progress = JSON.parse(data);
            }
        }
    }
})


let size = 5;

let database = [];

fs.readFile('db.json', 'utf-8', (err, data) => {
    if (err) {

    } else {
        if (data) {
            database = JSON.parse(data);
        }
    }
})

let iteration = 0;

ws.on('connection', socket => {
    socket.on('message', message => {
        let msg = JSON.parse(message);

        try {
            if (!msg.id) { return; }

            if (msg.id == 100) {
                if (!msg.label || !msg.value) { return; }

                msg.label = msg.label.split("");

                for (let label of msg.label) {
                    label = Number.parseInt(label);
                }

                if (!Number.isInteger(msg.value)) { return; }
                if (msg.value < 0 || msg.value > 9) { return; }

                if (msg.label.length == size ** 2) {
                    let valid = true;
                    for (let label of msg.label) {
                        if (label != 0 && label != 1) {
                            valid = false;
                        }
                    }

                    if (valid) {
                        database.push({ "value": Number.parseInt(msg.value), "key": msg.label.toString() });
                        fs.writeFile('db.json', JSON.stringify(database), (err) => { if (err) { console.log(err) } });
                        console.log(`${msg.value} Recieved [${9 - (database.length % 10)}]`);
                    } else {
                        console.log(`Rejected`)
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    })
})

function cycle() {
    if (database.length > 0) {
        console.log('================================');
        console.log('================================');
        console.log('TEST BEGINNING');
        console.log('================================');
        console.log('================================');
        for (let sample of database) {
            AI.inputs = [];
            AI.cost = 0;

            for (let input of sample.key.split("")) {
                if (input != ",") {
                    AI.inputs.push(Number.parseInt(input));
                }
            }

            console.log('Inputs Set');

            let outputs = AI.calculate(database.indexOf(sample));

            console.log('Calculated');

            let expectations = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            expectations[sample.value] = 1;

            for (let o = 0; o < AI.schema[AI.schema.length - 1]; o++) {
                AI.calculateErrors(AI.schema.length - 1, o, expectations);
            }

            //console.log(outputs);

            console.log(`Test for known number: ${sample.value}`);
            for (let n = 0; n < 10; n++) {
                console.log(`${n}: ${(outputs[n] * 100).toFixed(0)}%`);
            }
        }

        for (let l = AI.schema.length - 2; l >= 0; l--) {
            console.log(`${((l * 100) / AI.schema.length).toFixed(0)}%`);
            for (let o = 0; o < AI.schema[l]; o++) {
                AI.calculateErrors(l, o, []);
            }
        }

        console.log("100%");

        // console.log('Scaling Errors To Sample Size');

        // for (let layer of AI.net) {
        //     for (let node of layer) {
        //         node.error /= database.length;
        //     }
        // }

        // AI.cost /= database.length;

        console.log(`Network Cost: ${AI.cost.toFixed(4)}`);

        // fs.writeFile(`./Weights/${AI.cost.toFixed(4).toString().replace(".", "-")},${iteration}.json`, JSON.stringify(AI.weights), (err) => {
        //     if (err) {
        //         console.log(err);
        //     }
        // })

        progress.push(AI.cost);

        iteration++;
        //AI.learningRate = (0.1/(iteration**0.25));
        fs.writeFile('weights.json', JSON.stringify(AI.weights), (err) => { if (err) { console.log(err) } });
        fs.writeFile('progress.json', JSON.stringify(progress), (err) => { if (err) { console.log(err) } });

        for (let l = 0; l < AI.schema.length; l++) {
            console.log(`${((l * 100) / AI.schema.length).toFixed(0)}%`);
            for (let d = 0; d < l; d++) {
                AI.changeWeights(l, d);
            }
        }

    }

    setTimeout(() => {
        cycle();
    }, 5000)

    console.log("5 Seconds until Machine Learning");

    setTimeout(() => {
        console.log("4 Seconds until Machine Learning");
    }, 1000)
    setTimeout(() => {
        console.log("3 Seconds until Machine Learning");
    }, 2000)
    setTimeout(() => {
        console.log("2 Seconds until Machine Learning");
    }, 3000)
    setTimeout(() => {
        console.log("1 Second until Machine Learning");
    }, 4000)
}

cycle();

// for (let l = 0; l < AI.schema.length; l++) {
//     console.log(AI.weights[l]);
// }