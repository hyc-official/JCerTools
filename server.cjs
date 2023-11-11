const exp = require("express");
const expws = require("express-ws");
const cp = require("child_process");
const os = require("os");
const cs = require("./charset.cjs");
const file = require("./file.cjs");

const shell = (os.platform() === "win32" ? "cmd.exe" : "bash");
const port = 5237;

const app = exp();
expws(app);

app.get("/", (req, res) => {
    res.send("Hello JCerTools!");
});

app.ws("/shell", (ws, req) => {
    console.log("Shell connected");
    const term = cp.spawn(shell);
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
        console.log("Shell disconnected");
    });
});

app.ws("/file", (ws, req) => {
    console.log("File connected");
    let dir = process.cwd();
    ws.send(JSON.stringify({ok: true, dir, content: file.getFiles(dir)}));
    ws.on("message", (data) => {
        data = JSON.parse(data);
        switch (data.type) {
            case "cd":
                if (data.para.length < 1) {
                    ws.send(JSON.stringify({ok: false, error: "Command must have 1 parameters"}));
                } else {
                    const ndir = file.toDir(dir, data.para[0]);
                    if (!ndir.exist) {
                        ws.send(JSON.stringify({ok: false, error: "Directory does not exist"}));
                    } else {
                        dir = ndir.dir;
                        ws.send(JSON.stringify({ok: true, dir: ndir.dir}));
                    }
                }
                break;
            case "ls":
                ws.send(JSON.stringify({ok: true, dir, content: file.getFiles(dir)}));
                break;
            case "rm":
                if (data.para.length < 1) {
                    ws.send(JSON.stringify({ok: false, error: "Command must have 1 parameters"}));
                } else {
                    const cont = file.rmFile(dir, data.para[0]);
                    if (!cont.exist) {
                        ws.send(JSON.stringify({ok: false, dir: cont.dir, error: "File does not exist"}));
                    } else {
                        ws.send(JSON.stringify({ok: true, dir: cont.dir}));
                    }
                }
                break;
            case "cp":
                if (data.para.length < 2) {
                    ws.send(JSON.stringify({ok: false, error: "Command must have 2 parameters"}));
                } else {
                    const cont = file.cpFile(dir, data.para[0], data.para[1]);
                    if (!cont.exist) {
                        ws.send(JSON.stringify({ok: false, dir: cont.dir, error: "File does not exist"}));
                    } else {
                        ws.send(JSON.stringify({ok: true, dir: cont.dir}));
                    }
                }
                break;
            case "mv":
                if (data.para.length < 2) {
                    ws.send(JSON.stringify({ok: false, error: "Command must have 2 parameters"}));
                } else {
                    const cont = file.mvFile(dir, data.para[0], data.para[1]);
                    if (!cont.exist) {
                        ws.send(JSON.stringify({ok: false, dir: cont.dir, error: "File does not exist"}));
                    } else {
                        ws.send(JSON.stringify({ok: true, dir: cont.dir}));
                    }
                }
                break;
            case "mkdir":
                if (data.para.length < 1) {
                    ws.send(JSON.stringify({ok: false, error: "Command must have 1 parameters"}));
                } else {
                    const cont = file.mkdir(dir, data.para[0]);
                    ws.send(JSON.stringify({ok: true, dir: cont.dir}));
                }
                break;
            case "down":
                if (data.para.length < 1) {
                    ws.send(JSON.stringify({ok: false, error: "Command must have 1 parameters"}));
                } else {
                    const cont = file.readFile(dir, data.para[0]);
                    if (!cont.exist) {
                        ws.send(JSON.stringify({ok: false, dir: cont.dir, error: "File does not exist"}));
                    } else {
                        ws.send(JSON.stringify({ok: true, dir: cont.dir, filedata: cont.base64}));
                    }
                }
                break;
            case "up":
                if (data.para.length < 1) {
                    ws.send(JSON.stringify({ok: false, error: "Command must have 1 parameters"}));
                } else if (!data.filedata) {
                    ws.send(JSON.stringify({ok: false, error: "File data not found"}));
                } else {
                    file.writeFile(dir, data.para[0], data.filedata);
                    ws.send(JSON.stringify({ok: true}));
                }
                break;
            default:
                ws.send(JSON.stringify({ok: false, error: "Command not found"}));
        }
    });
    ws.on("close", () => {
        console.log("File disconnected");
        dir = null;
    });
});

app.listen(port, () => {
    console.log(`Start listening at port ${port}`);
});