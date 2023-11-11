const cs = require("./charset.cjs");
const fl = require("./file.cjs");

// By GPT
function splitParams(input) {
    // 去除两端空格
    input = input.trim();

    // 如果字符串为空，则返回空数组
    if (!input) {
        return [];
    }

    // 使用正则表达式将字符串按照空格分割，但保留带引号的参数
    const args = input.match(/"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'|\S+/g);

    // 去除参数两端的引号并还原转义字符
    const cleanedArgs = args.map(arg => {
        // 去除参数两端的引号
        const unquotedArg = arg.replace(/^["'](.*)["']$/, '$1');

        // 还原转义字符
        const unescapedArg = unquotedArg.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');

        return unescapedArg;
    });

    return cleanedArgs;
}

module.exports = {cs, fl, splitParams};