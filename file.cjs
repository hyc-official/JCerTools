const fse = require("fs-extra");
const path = require("path");

function getFiles(dir) {
    const raw = fse.readdirSync(dir);
    const res = [];
    raw.forEach((e) => {
        const edir = path.join(dir, e);
        const prop = {
            name: e,
            type: "UNKNOWN",
        };
        try {
            const stat = fse.statSync(edir);
            if (stat.isFile()) {
                prop.type = "FILE";
            } else if (stat.isDirectory()) {
                prop.type = "DIR";
            }
        } catch (err) {
            prop.error = err.message;
        }
        res.push(prop);
    });
    return res;
}
function chkDir(dir) {
    try {
        if (fse.existsSync(dir)) {
            const stat = fse.statSync(dir);
            if (stat.isDirectory()) {
                return true;
            }
        }
    } catch (err) {}
    return false;
}
function chkFile(dir) {
    try {
        if (fse.existsSync(dir)) {
            const stat = fse.statSync(dir);
            if (stat.isFile()) {
                return true;
            }
        }
    } catch (err) {}
    return false;
}
function toDir(dir, to) {
    const ndir = path.join(dir, to);
    if (path.isAbsolute(to) && chkDir(to)) {
        return {dir: to, exist: true};
    } else if (chkDir(ndir)) {
        return {dir: ndir, exist: true};
    } else {
        return {exist: false};
    }
}
function readFile(dir, file) {
    const fdir = path.join(dir, file);
    if (chkFile(fdir)) {
        const buf = fse.readFileSync(fdir);
        return {base64: buf.toString("base64"), dir: fdir, exist: true};
    } else {
        return {dir: fdir, exist: false};
    }
}
function writeFile(dir, file, data) {
    const fdir = path.join(dir, file);
    const buf = Buffer.from(data, "base64");
    if (chkDir(fdir)) {
        return {dir: fdir, exist: true};
    } else {
        fse.writeFileSync(fdir, buf);
        return {dir: fdir, exist: false};
    }
}
function rm(dir, file) {
    const fdir = path.join(dir, file);
    if (fse.existsSync(fdir)) {
        fse.removeSync(fdir);
        return {dir: fdir, exist: true};
    } else {
        return {dir: fdir, exist: false};
    }
}
function cp(dir, from, to) {
    const fdir = path.join(dir, from);
    const tdir = path.join(dir, to);
    if (fse.existsSync(fdir)) {
        fse.copySync(fdir, tdir);
        return {dir: tdir, exist: true};
    } else {
        return {dir: fdir, exist: false};
    }
}
function mv(dir, from, to) {
    const fdir = path.join(dir, from);
    const tdir = path.join(dir, to);
    if (fse.existsSync(fdir)) {
        fse.moveSync(fdir, tdir);
        return {dir: tdir, exist: true};
    } else {
        return {dir: fdir, exist: false};
    }
}
function mkdir(dir, nd) {
    const ndir = path.join(dir, nd);
    if (chkDir(ndir)) {
        return {dir: ndir, exist: true};
    } else {
        fse.mkdirSync(ndir);
        return {dir: ndir, exist: false};
    }
}

module.exports = {getFiles, chkDir, chkFile, toDir, readFile, writeFile, rm, cp, mv, mkdir};