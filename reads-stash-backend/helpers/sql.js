// Take in data and transform it to sql for update query

// Example: data = {"username" : "bigDeal100", "fname" : "Big", "lname" : "Deal"}
// returns {
// columns: '"username"=$1, "fname"=$2, "lname"=$3',
// values: ["bigDeal100", "Big", "Deal"]
// }

function dataToSql(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return { error: "No data" };

    const columns = keys.map((name, idx) => `"${name}" = $${idx + 1}`);
    const values = Object.values(data);

    return {
        columns: columns.join(", "),
        values: values,
    };
}

module.exports = { dataToSql };
