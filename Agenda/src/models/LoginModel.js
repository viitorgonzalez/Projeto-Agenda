const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

// Definição do esquema do modelo de Login
const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});

// Criação do modelo de Login com base no esquema definido
const LoginModel = mongoose.model('Login', LoginSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  // Método para realizar o login
  async login() {
    this.validate();
    if (this.errors.length > 0) return;

    // Busca o usuário com o email fornecido
    this.user = await LoginModel.findOne({ email: this.body.email });

    if (!this.user) {
      this.errors.push('Usuário não existe.');
      return;
    }

    // Verifica se a senha fornecida é válida
    const isPasswordValid = await bcryptjs.compare(this.body.password, this.user.password);

    if (!isPasswordValid) {
      this.errors.push('Senha inválida');
      this.user = null;
      return;
    }
  }

  // Método para realizar o registro de um novo usuário
  async register() {
    this.validate();
    if (this.errors.length > 0) return;

    await this.checkUserExists();

    if (this.errors.length > 0) return;

    // Gera o salt e realiza o hash da senha fornecida
    const salt = await bcryptjs.genSalt();
    this.body.password = await bcryptjs.hash(this.body.password, salt);

    // Cria o novo usuário no banco de dados
    this.user = await LoginModel.create(this.body);
  }

  // Método para validar os campos de email e senha
  validate() {
    this.cleanUp();

    // Validação do email
    if (!validator.isEmail(this.body.email)) {
      this.errors.push('Email inválido');
    }

    // Validação da senha
    if (this.body.password.length < 3 || this.body.password.length > 50) {
      this.errors.push('A senha precisa ter entre 3 e 50 caracteres.');
    }
  }

  // Método para verificar se um usuário com o email fornecido já existe
  async checkUserExists() {
    this.user = await LoginModel.findOne({ email: this.body.email });
    if (this.user) {
      this.errors.push('Email já cadastrado.');
    }
  }

  // Método para limpar os campos do objeto body e garantir que sejam strings
  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }

    this.body = {
      email: this.body.email.trim(),
      password: this.body.password
    };
  }
}

module.exports = Login;
