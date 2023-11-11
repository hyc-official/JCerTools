const rl = require("readline");
const chalk = require("chalk");
const WebSocket = require("ws");
const ut = require("./utils.cjs");

const rli = rl.createInterface({input: process.stdin});

function filet(host) {
    const ws = new WebSocket(`ws://${host}/file`);
    let filedata = undefined;
    ws.on("open", () => {
        console.log(`Connected to: ${host}`);
    });
    rli.on("line", (data) => {
        data = ut.splitParams(data);
        if (data[0] === "exit") {
            ws.close();
        } else if (data[0] === "read") {
            if (!data[1]) {
                console.log(chalk.red("Error: File name missing"));
            } else {
                const cont = ut.fl.readFile(process.cwd(), data[1]);
                if (!cont.exist) {
                    console.log(chalk.red("Error: File missing"));
                } else {
                    filedata = cont.base64;
                    console.log(chalk.green("Filedata updated"));
                    console.log(filedata);
                }
            }
        } else if (data[0] === "write") {
            if (!data[1]) {
                console.log(chalk.red("Error: File name missing"));
            } else if (!filedata) {
                console.log(chalk.red("Error: Filedata missing"));
            } else {
                ut.fl.writeFile(process.cwd(), data[1], filedata);
                console.log(chalk.green("File saved"));
            }
        } else {
            const param = {type: data[0], filedata};
            data.shift();
            param.para = data;
            ws.send(JSON.stringify(param));
        }
    });
    rli.on("close", () => {
        ws.close();
    });
    ws.on("message", (data) => {
        if (data) {
            data = JSON.parse(data);
            if (data.ok) {
                console.log(chalk.green("OK"));
                if (data.dir) {
                    console.log(chalk.gray(data.dir));
                }
                if (data.content) {
                    console.log(chalk.blue("DIR") + " " + chalk.yellow("FILE") + " " + chalk.magenta("UNKNOWN"));
                    const str = [];
                    data.content.forEach((e) => {
                        if (e.type === "DIR") {
                            str.push(chalk.blue(e.name));
                        } else if (e.type === "FILE") {
                            str.push(chalk.yellow(e.name));
                        } else {
                            str.push(chalk.magenta(e.name));
                        }
                    });
                    console.log(str.join(" / "));
                }
            } else {
                console.log(chalk.red(`UNOK ${data.error}`));
            }
            if (data.filedata) {
                filedata = data.filedata;
                console.log(chalk.green("Filedata updated"));
            }
        }
    });
    ws.on("close", () => {
        console.log("Disconnected");
        process.exit();
    });
}

process.stdout.write("Enter JCerTools host: ");
rli.question("", (data) => {
    filet(data);
});