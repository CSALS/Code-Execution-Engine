const Docker = require("simple-dockerode");
const short = require("short-uuid");
const uuid = short();

module.exports = class DockerContainer {
    constructor(language) {
        this.docker = new Docker();
        this.imageName = language + "/sandbox";
    }

    /**
     * @returns a random container name
     */
    getContainerName() {
        const containerUUID = uuid.new();
        return `container-${containerUUID}`;
    }

    /**
     * @description Creates a new docker container based on csals/sandbox docker image which was created using Dockerfile present in root directory
     * @returns container name
     */
    async createContainer() {
        this.containerName = this.getContainerName();
        this.container = await this.docker.createContainer({
            Image: this.imageName,
            name: this.containerName,
            Tty: true,
            OpenStdin: false,
            AttachStdin: true,
            WorkingDir: "/",
            StopTimeout: 15
        });
        await this.container.start();
        return this.containerName;
    }

    /**
     * @description Executes the command passed in our container
     * @param {The command to execute in our container} command 
     * @returns A json object containing the stdout and stderr results after executing the command
     */
    async execute(command) {
        return new Promise(async (resolve, reject) => {
            this.container.exec(command, { stdout: true, stderr: true }, (err, results) => {
                if (err) return reject(err);
                resolve({ "output": results.stdout, "error": results.stderr });
            });
        })
    }

    async inspect() {
        const data = await this.container.inspect();
        return data;
    }
    removeContainer() {
        return this.container.remove({ force: true });
    }
    async stop() {
        return await this.container.kill();
    }
};
