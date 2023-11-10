const rl = require("readline");
const WebSocket = require("ws");
const cs = require("./charset.cjs");

const rli = rl.createInterface({input: process.stdin});

function shell(host) {
    const ws = new WebSocket(`ws://${host}/shell`);
    let latest_input = null;
    ws.on("open", () => {
        process.stdout.write(`Connected to: ${host}\n\n`);
    });
    rli.on("line", (data) => {
        ws.send(cs.b64enc(data + "\n"));
        latest_input = data + "\n";
    });
    ws.on("message", (data) => {
        data = cs.b64dec(data);
        if (data !== latest_input) {
            process.stdout.write(data);
        }
    });
    ws.on("close", () => {
        process.stdout.write("\nDisconnected\n");
        process.exit();
    });
}

process.stdout.write("Enter JCerTools host: ");
rli.question("", (data) => {
    shell(data);
});