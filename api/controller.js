module.exports = (app) => {
    const sqlite3 = require("sqlite3");
    const sql = require("./sql.js")(new sqlite3.Database("./api/db.db"));

    const YAML = {
        __jsyaml: require("js-yaml"),
        stringify : (data) => {
            return YAML.__jsyaml.safeDump(data)
        }
    };

    let authenticate = async (req) => {
        return new Promise((resolve, reject) => {
            console.log(`SELECT (KEY) FROM API_CLIENTS WHERE KEY = "${sql.sanitise(req.query.apiKey)}"`);
            sql.get(`SELECT (KEY) FROM API_CLIENTS WHERE KEY = "${sql.sanitise(req.query.apiKey)}"`)
                .then((row) => {
                    console.log(row);
                    resolve(row !== undefined)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    };

    let decode_resolve = (req, res, next, data) => {
        switch ((req.query.dataType || "").toUpperCase()) {
            case "JSON":
                data = JSON.stringify(data);
                break;

            case "YAML":
                data = YAML.stringify(data);
                break;

            default:
                data = JSON.stringify(data);
        }
        res.send(data);
        next()
    };

    app.all("/api/*", async (req, res, next) => {
        if (!await authenticate(req)) {
            decode_resolve(req, res, next, {
                error: "Invalid API Key",
                err_code: 401
            });
        } else {
            let command = req.path.replace("/api/", "");

            if (command.startsWith("parks")) {
                if (command === "parks/list") {
                    sql.all("SELECT (NAME) FROM PARKS")
                        .then((rows) => {
                            decode_resolve(req, res, next, rows.map(obj => {
                                return obj.NAME
                            }))
                        })
                        .catch((err) => {
                            decode_resolve(req, res, next, {
                                error: err.toString(),
                                err_code: 500
                            })
                        })
                } else if (command === "parks") {
                    decode_resolve(req, res, next, {
                        error: `Specify a valid command for 'parks'.`,
                        err_code: 404
                    })
                } else {
                    //find park info
                    //get park in request.
                    let park = command.replace("parks/", "").replace(new RegExp("%20", 'g')," ");
                    sql.get(`SELECT NAME, LOCATION, WEBSITE FROM PARKS WHERE NAME="${sql.sanitise(park)}"`)
                        .then((row) => {
                            if (row) {
                                decode_resolve(req, res, next, row)
                            } else {
                                decode_resolve(req, res, next, {
                                    error: `Park '${park}' is not a valid park in the database.`,
                                    err_code: 404
                                })
                            }
                        })
                        .catch((err) => {
                            decode_resolve(req, res, next, {
                                error: err.toString(),
                                err_code: 500
                            })
                        })

                }
            } else {
                decode_resolve(req, res, next, {
                    error: `Invalid API command '${command}'.`,
                    err_code: 404
                })
            }
        }
    });
};