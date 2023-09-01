var pool = require('./db');
var md5 = require('md5');

async function login(usuario, password) {
    try {
        var query = 'select * from usuarios where username = ? and password = ? and estado = ? limit 1';
        console.log(query);
        var rows = await pool.query(query, [usuario, md5(password), 1])
        return rows[0];
    } catch (error) {
        console.log(error)
    }
}

async function store() {
    try {
        var query = "INSERT INTO usuarios SET ? "
        var rows = await pool.query(query, [obj]);
        return rows;
    } catch (error) {
        console.log('Error')
        throw error;
    }

}

async function getUsuarioById(id) {
    var query = `
        SELECT agentes.*, usuarios.*
        FROM agentes
        INNER JOIN usuarios ON agentes.usuario = usuarios.id
        WHERE agentes.id_agente = ? AND agentes.estado = 1
        ORDER BY agentes.id_agente DESC
        LIMIT 1
    `;
    var rows = await pool.query(query, [id]);
    return rows[0];
}

async function update(obj, id) {
    try {
        var query = "update usuarios set ? where id = ?";
        var rows = await pool.query(query, [obj, id]);
        return rows;
    } catch (error) {
        console.log(error)
    }
}
module.exports = { login, store, getUsuarioById }