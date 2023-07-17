// Take in data and transform it to sql for update query

// Example:
// input = {"username" : "bigDeal100", "fname" : "Big", "lname" : "Deal"}
// output = {
// columns: 'username = $1, fname = $2, lname = $3',
// values: ["bigDeal100", "Big", "Deal"]
// }

function dataToSql(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return { error: "No data" };

    const columns = keys.map((name, idx) => `${name} = $${idx + 1}`);
    const values = Object.values(data);

    return {
        columns: columns.join(", "),
        values: values,
    };
}

function dataToSqlForCreate(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return { error: "No data" };

    const columns = keys.map((name, idx) => `$${idx + 1}`);
    const values = Object.values(data);

    return {
        columns: columns.join(", "),
        values: values,
        keys: keys.join(", "),
    };
}

module.exports = { dataToSql, dataToSqlForCreate };
