const Contato = require('../models/ContatoModel');

exports.index = async(req, res) => {
    const contatos = new Contato();
    await contatos.buscaContatos();
    res.render('index', { contatos });
};