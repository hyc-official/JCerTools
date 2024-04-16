const iconv = require("iconv-lite");
const jscd = require("jschardet");
const os = require("os");

const shlenc = (os.platform() === "win32" ? "GB2312" : "UTF-8"), screnc = "UTF-8";

module.exports = {
    b64enc: (data) => {
        return Buffer.from(data).toString("base64");
    },
    b64dec_shl: (data) => {
        data = Buffer.from(data, "base64");
        const cdres = jscd.detect(data);
        return iconv.encode(iconv.decode(data, cdres.encoding), shlenc);
    },
    b64dec_scr: (data) => {
        data = Buffer.from(data, "base64");
        const cdres = jscd.detect(data);
        return iconv.encode(iconv.decode(data, cdres.encoding), screnc);
    },
};