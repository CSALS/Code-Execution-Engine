const express = require("express");
const bodyParser = require("body-parser");
const { createProgramFile, executeProgram, deleteFilesAndContainer } = require("./middlewares/middlewares");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); //serve static files from the public folder

const port = 5001;
app.listen(port, () => { console.log(`Listening on port ${port}`) })


app.post("/execute", [createProgramFile, executeProgram, deleteFilesAndContainer], async (req, res) => {
    res.status(200).json({
        output: req.output,
        error: req.error,
        stderr: req.stderr,
        runtime: req.runtime,
    });
});