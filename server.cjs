const exp = require("express");
const expws = require("express-ws");
const cp = require("child_process");
const os = require("os");
const cs = require("./charset.cjs");

const shell = (os.platform() === "win32" ? "cmd.exe" : "bash");
const port = 5237;

const app = exp();
expws(app);

app.get("/", (req, res) => {
    res.send("Hello JCerTools!");
});

app.ws("/shell", (ws, req) => {
    const term = cp.spawn(shell);
    console.log("Connected");
    term.stdout.on("data", (data) => {
        ws.send(cs.b64enc(data));
    });
    term.stderr.on("data", (data) => {
        ws.send(cs.b64enc(data));
    });
    term.on("close", () => {
        ws.close();
    });
    ws.on("message", (data) => {
        term.stdin.write(cs.b64dec(data));
    });
    ws.on("close", () => {
        term.kill();
        console.log("Disconnected");
    });
});

app.listen(port, () => {
    console.log(`Start listening at port ${port}`);
});