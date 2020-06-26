const extensions = {
    "c": "c",
    "cpp": "cpp",
    "java": "java",
    "javascript": "js",
    "python2": "py",
    "python3": "py",
};

const noCompilation = {
    "python2": 1, "python3": 1, "javascript": 1
};


const getCompileCommand = (language, sourceFile) => {
    if (language === "c") {
        return [
            "/bin/sh",
            "-c",
            `gcc ${sourceFile}`
        ];
    } else if (language === "cpp") {
        return [
            "/bin/sh",
            "-c",
            `g++ ${sourceFile}`
        ];
    }
};

const getExecuteCommand = (language, sourceFile, inputFile) => {
    if (language === "c" || language === "cpp") {
        return [
            "/bin/sh",
            "-c",
            `./a.out < ./${inputFile}`
        ];
    } else if (language === "javascript") {
        //TODO
    } else if (language === "python2" || language === "python3") {
        return [
            "/bin/sh",
            "-c",
            `${language} ${sourceFile} < ${inputFile}`
        ];
    }
};

module.exports = { extensions, noCompilation, getCompileCommand, getExecuteCommand }