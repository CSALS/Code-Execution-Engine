const DockerContainer = require("../docker/docker");
const short = require("short-uuid");
const uuid = short();
const fs = require("fs");
const shell = require("shelljs");
const util = require("util");
const { extensions, noCompilation, getCompileCommand, getExecuteCommand } = require("../languages");
const {
  performance,
  PerformanceObserver
} = require('perf_hooks');

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
        const language = req.body.language;
        const docker = new DockerContainer(language);
        const containerName = await docker.createContainer();
        console.log("Container name = ", containerName);

        //Copy source code from local to container
        shell.exec(`docker cp code/${req.sourceFile} ${containerName}:/${req.sourceFile}`);
        //Copy input from local to container
        shell.exec(`docker cp code/${req.inputFile} ${containerName}:/${req.inputFile}`);


        if (noCompilation[language] === 1) {
            //Interpreted languages. Directly execute them
            const startTime = performance.now();
            const executeResponse = await docker.execute(getExecuteCommand(language, req.sourceFile, req.inputFile));
            const endTime = performance.now();
            req.output = executeResponse.output;
            if (executeResponse.error === null || executeResponse.error === undefined || executeResponse.error === "")
                req.error = "";
            else
                req.error = "Exeuction Error";
            req.stderr = executeResponse.error;
            req.runtime = (endTime - startTime) + "ms"
        } else {
            //Compiled languages. Compile them first and then execute
            const compileCommand = getCompileCommand(language, req.sourceFile);
            console.log("Compile Command: ", compileCommand);
            const compileResponse = await docker.execute(compileCommand);
            console.log("Compile Response: ", compileResponse);
            if (compileResponse.error === null || compileResponse.error === undefined || compileResponse.error === "") {
                console.log("Compile Success");
                //TODO: while executing we need to setup a timer so that we can throw TLE
                const executeCommand = getExecuteCommand(language, req.sourceFile, req.inputFile);
                console.log("Execute Command: ", executeCommand);

                const timer = setTimeout(async () => {
                    try {
                        console.log("Process timed Out! Check for infinite loops!");
                        const inspectData = await docker.inspect();
                        if (inspectData.State.Running) {
                            docker.removeContainer();
                            console.log(
                                "Detected infinite loop! Killing right away...."
                            );
                            req.output = "";
                            req.error = "TLE";
                            req.stderr = "Time Limit Exceeded";
                            next();
                        }
                    } catch (err) {
                        throw err;
                    }
                }, 15000);
                const startTime = performance.now();
                const executeResponse = await docker.execute(executeCommand);
                const endTime = performance.now();
                clearTimeout(timer);
                console.log("Execute Response: ", executeResponse);
                req.output = executeResponse.output;
                if (executeResponse.error === null || executeResponse.error === undefined || executeResponse.error === "")
                    req.error = "";
                else
                    req.error = "Exeuction Error";
                req.stderr = executeResponse.error;
                req.runtime = (endTime - startTime) + "ms"
            } else {
                req.output = "";
                req.error = "Compilation Error";
                req.stderr = compileResponse.error;
                console.log(req.stderr);
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
    fs.access(util.format("./code/%s", req.sourceFile), fs.F_OK, err => {
        if (err) {
            return;
        }
        fs.unlink(util.format("./code/%s", req.sourceFile), err => {
            if (err) {
                console.log(err);
            }
        });
    });

    //Remove the inputFile
    fs.access(util.format("./code/%s", req.inputFile), fs.F_OK, err => {
        if (err) {
            return;
        }
        fs.unlink(util.format("./code/%s", req.inputFile), err => {
            if (err) {
                console.log(err);
            }
        });
    });

    next();
}

module.exports = { createProgramFile, executeProgram, deleteFilesAndContainer }