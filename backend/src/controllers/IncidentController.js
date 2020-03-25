const connection = require('../database/connection');

module.exports = {
  async index(req, res) {
    const { page = 1 } = req.body;

    const [count] = await connection('incidents').count();

    const incidents = await connection('incidents')
      .join('ongs', 'ongs.id', '=', 'incidents.ongs_id')
      .limit(5)
      .offset((page - 1) * 5)
      .select([
        'incidents.*',
        'ongs.name',
        'ongs.email',
        'ongs.whatsapp',
        'ongs.city',
        'ongs.uf'
      ]);

    res.header('X-Total-Count', count['count(*)']);

    return res.json(incidents);
  },

  async create(req, res) {
    const { title, description, valor } = req.body;

    const ong_id = req.header.authorization;

    const result = await connection('incidents').insert({
      title,
      description,
      valor,
      ong_id
    });

    return res.json(result[0]);
  },

  async delete(req, res) {
    const { id } = req.params;

    const ong_id = req.header.authorization;
    const incident = await connection('incidents')
      .where('id', id)
      .select('ong_id')
      .first();

    if (incident.id != ong_id) {
      return res.status(401).json({ error: 'Operation not allowed.' });
    }

    await connection('incidents')
      .where('id', id)
      .delete();

    return res.status(204).send();
  }
};
