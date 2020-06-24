const extensions = {
    "c": "c",
    "cpp": "cpp",
    "java": "java",
    "javascript": "js",
    "python": "py"
};

const noCompilation = {
    "python": 1, "javascript": 1
};


const getCompileCommand = (language, sourceFile) => {
    if (language === "c") {
        return [
            "/bin/sh",
            "-c",
            `gcc ${sourceFile}`
        ];
    } else if (language === "cpp") {
        //TODO
    } else if (language === "javascript") {
        //TODO
    } else if (language === "python") {
        //TODO
    }
};

const getExecuteCommand = (language, sourceFile, inputFile) => {
    if (language === "c") {
        return [
            "/bin/sh",
            "-c",
            `./a.out < ./${inputFile}`
        ];
    } else if (language === "cpp") {
        //TODO
    } else if (language === "javascript") {
        //TODO
    } else if (language === "python") {
        //TODO
    }
};

module.exports = { extensions, noCompilation, getCompileCommand, getExecuteCommand }