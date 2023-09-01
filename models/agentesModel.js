var pool = require('./db.js')
async function index() {
    var query = `
        SELECT agentes.*, usuarios.*
        FROM agentes
        INNER JOIN usuarios ON agentes.usuario = usuarios.id
        WHERE agentes.estado = 1
        ORDER BY agentes.id_agente DESC
    `;
    var rows = await pool.query(query);
    return rows
}
async function store() {
    try {
        var query = "INSERT INTO agentes SET ? "
        var rows = await pool.query(query, [obj]);
        return rows;
    } catch (error) {
        console.log('Error')
        throw error;
    }

}

async function eliminar(id) {
    //Consulto el id del usuario del agente
    var consultaidUsuario = 'SELECT * FROM agentes where id_agente = ?';
    var resConsulta = await pool.query(consultaidUsuario, id);
    var idUsuario = resConsulta[0].usuario
    //Actualizo el estado del usuario a 0
    var actualizoEstadoUsuario = 'UPDATE usuarios SET estado = 0 WHERE id = ?';
    var resActualizoEstadoUsuario = await pool.query(actualizoEstadoUsuario, idUsuario);
    //Actualizo el estado del agente a 0
    var actualizoEstadoAgente = 'UPDATE agentes SET estado = 0 WHERE id_agente = ?';
    var resActualizoEstadoAgente = await pool.query(actualizoEstadoAgente, id);
    return resActualizoEstadoAgente;
}

async function getAgenteById(id) {
    var query = `
        SELECT agentes.*, usuarios.*
        FROM agentes
        INNER JOIN usuarios ON agentes.usuario = usuarios.id
        WHERE id_agente = ?
        ORDER BY agentes.id_agente DESC
    `;
    var rows = await pool.query(query, [id]);
    return rows[0];
}
async function update(objAgente, objUsuario, id_agente, id) {
    try {
        var queryAgentes = "update agentes set ? where id_agente = ?";
        var rowsAgentes = await pool.query(queryAgentes, [objAgente, id_agente]);
        var queryUsuarios = "update usuarios set ? where id = ?";
        var rowsUsuarios = await pool.query(queryUsuarios, [objUsuario, id]);
        return [rowsAgentes, rowsUsuarios];
    } catch (error) {
        console.log(error)
    }
}
module.exports = { index, store, eliminar, getAgenteById, update }