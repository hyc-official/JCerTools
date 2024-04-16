const rl = require("readline");
const WebSocket = require("ws");
const ut = require("./utils.cjs");

const rli = rl.createInterface({input: process.stdin});

function shell(host) {
    const ws = new WebSocket(`ws://${host}/shell`);
    ws.on("open", () => {
        process.stdout.write(`Connected to: ${host}\n\n`);
    });
    rli.on("line", (data) => {
        ws.send(ut.cs.b64enc(data + "\n"));
    });
    rli.on("close", () => {
        ws.close();
    });
    ws.on("message", (data) => {
        process.stdout.write(ut.cs.b64dec_scr(data));
    });
    ws.on("close", () => {
        process.stdout.write("\nDisconnected");
        process.exit();
    });
}

process.stdout.write("Enter JCerTools host: ");
rli.question("", (data) => {
    shell(data);
});