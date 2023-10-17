var pool = require('./bd');

async function getNovedades(){
    var query = 'select * from tendencias';
    var rows = await pool.query(query);
    return rows;
}

async function deleteNovedadesById(id) {
    var query = 'DELETE FROM tendencias WHERE id = ?';
    var result = await pool.query(query, [id]);
    return result;
}

async function insertNovedades(obj) {
    try {
        var query = "insert into tendencias set ?";
        var rows = await pool.query(query, [obj])
        return rows;

    } catch (error) {
        console.log(error);
        throw error;
    }
    }

    async function getNovedadById(id) {
        var query = "select * from tendencias where id=? ";
        var rows = await pool.query(query, [id]);
        return rows[0];
    }

    async function editarNovedadesById(id, obj) {
        try {
            var query = "update tendencias set ? where id = ?";
            var rows = await pool.query(query, [obj, id]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
    
     

    module.exports = { getNovedades, deleteNovedadesById, insertNovedades, getNovedadById, editarNovedadesById };
