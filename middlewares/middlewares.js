const DockerContainer = require("../Docker/docker");
const short = require("short-uuid");
const uuid = short();
const fs = require("fs");
const shell = require("shelljs");
const util = require("util");
const { extensions, noCompilation, getCompileCommand, getExecuteCommand } = require("../languages");


/**
 * @description Creates a file to store source code and input in our local machine
 */
const createProgramFile = async (req, res, next) => {
    req.sourceFile = uuid.new() + `.${extensions[req.body.language]}`;
    req.inputFile = uuid.new() + `.in`;
    fs.writeFile(util.format("./code/%s", req.sourceFile), req.body.code, err => {
        if (err) {
            res.json({ error: err });
        }
        fs.writeFile(util.format("./code/%s", req.inputFile), req.body.input, err => {
            if (err) {
                res.json({ error: err });
            }
            next();
        })
    });
}


/**
 * @description Spins up a new docker container and copies the source code and input file to that container.
 *              Then depending on the language the it is either directly executed or first compiled and then executed.
 */
const executeProgram = async (req, res, next) => {
    try {
        const docker = new DockerContainer();
        const containerName = await docker.createContainer();
        console.log("Container name = ", containerName);

        //Copy source code from local to container
        shell.exec(`docker cp code/${req.sourceFile} ${containerName}:/${req.sourceFile}`);
        //Copy input from local to container
        shell.exec(`docker cp code/${req.inputFile} ${containerName}:/${req.inputFile}`);

        const language = req.body.language;

        if (noCompilation[language] === 1) {
            //Interpreted languages. Directly execute them
            const executeResponse = await docker.execute(getExecuteCommand(language, req.sourceFile, req.inputFile));
            req.output = executeResponse.output;
            req.error = executeResponse.error;
        } else {
            //Compiled languages. Compile them first and then execute
            const compileCommand = getCompileCommand(language, req.sourceFile);
            console.log(compileCommand);
            const compileResponse = await docker.execute(compileCommand);

            if (compileResponse.err === null || compileResponse.err === undefined || compileResponse.err === "") {
                console.log("Compile Success");
                //TODO: while executing we need to setup a timer so that we can throw TLE
                const executeCommand = getExecuteCommand(language, req.sourceFile, req.inputFile);
                console.log(executeCommand);

                const executeResponse = await docker.execute(executeCommand);
                console.log(executeResponse);

                req.output = executeResponse.output;
                req.error = executeResponse.error;
            } else {
                req.output = "";
                req.error = "Compilation Error";
            }
        }
        req.containerName = containerName;
        next();
    } catch (err) {
        console.log(err);
        req.error = "Backend problem";
        next();
    }
}

/**
 * @description This middleware function is called after executeCommand(). We delete the container and source code and input
 */
const deleteFilesAndContainer = async (req, res, next) => {
    //Delete the container
    shell.exec(`docker rm ${req.containerName} --force`);

    //Remove the sourceFile
    fs.access(util.format("/code/%s", req.sourceFile), fs.F_OK, err => {
        if (err) {
            return;
        }
        fs.unlink(util.format("/code/%s", req.sourceFile), err => {
            if (err) {
                console.log(err);
            }
        });
    });

    //Remove the inputFile
    fs.access(util.format("/code/%s", req.inputFile), fs.F_OK, err => {
        if (err) {
            return;
        }
        fs.unlink(util.format("/code/%s", req.inputFile), err => {
            if (err) {
                console.log(err);
            }
        });
    });

    next();
}

module.exports = { createProgramFile, executeProgram, deleteFilesAndContainer }