
// content of index.js
const express = require('express')
const app = express();
const port = 3000;
const bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4')
const { spawn, exec, execFile } = require('child_process');
const fs = require('fs');
var rimraf = require("rimraf");
var stream   = require('stream');
let UID = 1001;
let GID = 1001;

app.use(bodyParser.json());



app.post('/', function(req, response) {

    let code = req.body.code;
    let input = req.body.input;
    let id = uuidv4();
    

    let current_dir = process.cwd() + '/' + id;
    fs.mkdir(current_dir, function (err) {

        if (err) {
            console.log(err);
            response.send({err: err.message});
            response.end();
            return;
        }

        fs.writeFile(current_dir + '/main.c', code, function (err) {

            if (err) {
                rimraf(current_dir, {}, function (err) {
                    console.log(err);
                });
                console.log(err);
                response.send({err: err.message});
                response.end();
                return;

            }


            let result = {
                stdout: "",
                run_stderr: ""

            };


            build = exec(
                'g++ -o main main.c', {
                    cwd: current_dir

                },
                function (err, stdout, stderr) {

                    if (err) {
                        result.build_stderr = stderr;
                        response.send(result);
                        return;
                    }

                   let run = exec(
                    "./main", {
                        timeout: 6000,
                        cwd: current_dir,
                        uid: UID,
                        gid: GID
                       },
                    function (err, stdout, stderr) {

                        if (err) {
                            if (err.signal == 'SIGINT' || err.signal == 'SIGTERM') {
                                result.stderr = "Programul dureaza > 6s. Sanse mari de bucla infinita.";
                                response.send(result);
                                return;
                            }
                        }
                        result.stdout = stdout;
                        result.stderr = stderr;

                        rimraf(current_dir, {}, function (err) {
                                console.log("Close: " + err);
                        });

                        response.send(result);
                        response.end();


                    });

                    let stdinStream = new stream.Readable();
                    stdinStream.push(input);
                    stdinStream.push(null);
                    stdinStream.pipe(run.stdin);
            })


        });

    });

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))








