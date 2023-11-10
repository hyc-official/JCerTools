const iconv = require("iconv-lite");
const jscd = require("jschardet");
const os = require("os");

const encode = (os.platform() === "win32" ? "gb2312" : "utf-8");

module.exports = {
    b64enc: (data) => {
        const cdres = jscd.detect(data);
        return Buffer.from(data).toString("base64");
    },
    b64dec: (data) => {
        data = Buffer.from(data, "base64");
        const cdres = jscd.detect(data);
        return iconv.decode(data, cdres.encoding);
    },
};