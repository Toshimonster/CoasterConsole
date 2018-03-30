module.exports = (database) => {
    return {
        sanitise : (str) => {
            return str.replace(/\\([\s\S])|(")/g,"\\$1$2")
        },
        get : async (command) => {
            return new Promise((resolve, reject) => {
                database.serialize(() => {
                    database.get(command, (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    })
                })
            })
        },
        all : async (command) => {
            return new Promise((resolve, reject) => {
                database.serialize(() => {
                    database.all(command, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    })
                })
            })
        },
        run : async (command) => {
            return new Promise((resolve, reject) => {
                database.serialize(() => {
                    database.run(command, (err) => {
                        if (err) reject(err);
                        else resolve();
                    })
                })
            })
        }
    }
};