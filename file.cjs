const fs = require("fs");
const path = require("path");

function getFiles(dir) {
    const raw = fs.readdirSync(dir);
    const res = [];
    raw.forEach((e) => {
        const edir = path.join(dir, e);
        const prop = {
            name: e,
            type: "UNKNOWN",
        };
        try {
            const stat = fs.statSync(edir);
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
    return fs.existsSync(dir);
}

function toDir(dir, to) {
    const ndir = path.join(dir, to);
    const exist = fs.existsSync(ndir);
    return {dir: ndir, exist};
}

function readFile(dir, file) {
    const fdir = path.join(dir, file);
    if (fs.existsSync(fdir)) {
        const buf = fs.readFileSync(fdir);
        return {base64: buf.toString("base64"), dir: fdir, exist: true};
    } else {
        return {dir: fdir, exist: false};
    }
}

function writeFile(dir, file, data) {
    const fdir = path.join(dir, file);
    const buf = Buffer.from(data, "base64");
    fs.writeFileSync(fdir, buf);
}

function rmFile(dir, file) {
    const fdir = path.join(dir, file);
    if (fs.existsSync(fdir)) {
        fs.rmSync(fdir);
        return {dir: fdir, exist: true};
    } else {
        return {dir: fdir, exist: false};
    }
}

function cpFile(dir, from, to) {
    const fdir = path.join(dir, from);
    const tdir = path.join(dir, to);
    if (fs.existsSync(fdir)) {
        fs.cpSync(fdir, tdir);
        return {dir: tdir, exist: true};
    } else {
        return {dir: fdir, exist: false};
    }
}

function mvFile(dir, from, to) {
    const fdir = path.join(dir, from);
    const tdir = path.join(dir, to);
    if (fs.existsSync(fdir)) {
        fs.cpSync(fdir, tdir);
        fs.rmSync(fdir);
        return {dir: tdir, exist: true};
    } else {
        return {dir: fdir, exist: false};
    }
}

function mkdir(dir, nd) {
    const ndir = path.join(dir, nd);
    fs.mkdirSync(ndir);
    return {dir: ndir, exist: true};
}

module.exports = {getFiles, chkDir, toDir, readFile, writeFile, rmFile, cpFile, mvFile, mkdir};