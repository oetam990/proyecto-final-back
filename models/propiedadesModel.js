var pool = require('./db.js')

async function index(destacada) {
    var query
    var rows
    if (destacada) {
        query = "SELECT * FROM propiedades WHERE estado = ? AND destacada = ? ORDER BY id DESC";
        var rows = await pool.query(query, [1, true]);
    } else {
        query = "SELECT * FROM propiedades WHERE estado = 1 ORDER BY id DESC";
        rows = await pool.query(query);
    }

    return rows
}

async function show(id) {
    var query
    var rows

    query = "SELECT * FROM propiedades WHERE estado = ? AND id = ?";
    var rows = await pool.query(query, [1, id]);
    return rows
}


async function store() {
    try {
        var query = "INSERT INTO propiedades SET ? "
        var rows = await pool.query(query, [obj]);
        return rows;
    } catch (error) {
        console.log('Error')
        throw error;
    }

}

async function eliminar(id) {
    //Actualizo el estado de propiedad a 0
    var query = 'UPDATE propiedades SET estado = 0 WHERE id = ?';
    var rows = await pool.query(query, id);
    return rows;
}

async function getPropiedadById(id) {
    var query = "select * from propiedades where id = ? ";
    var rows = await pool.query(query, [id]);
    return rows[0];
}

async function update(obj, id) {
    try {
        var query = "update propiedades set ? where id = ?";
        var rows = await pool.query(query, [obj, id]);
        return rows;
    } catch (error) {
        console.log(error)
    }
}

module.exports = { index, store, eliminar, getPropiedadById, update, show }