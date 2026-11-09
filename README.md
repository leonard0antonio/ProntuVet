<h1 align="center">
  🐾 ProntuVet
</h1>

<p align="center">
  <em>Sistema moderno e intuitivo para gestão de clínicas veterinárias e prontuários médicos.</em>
</p>

<p align="center">
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/leonard0antonio/ProntuVet">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/leonard0antonio/ProntuVet">
  <a href="https://github.com/leonard0antonio/ProntuVet/commits/main">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/leonard0antonio/ProntuVet">
  </a>
  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen">
</p>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-como-executar">Como executar</a> •
  <a href="#-contribuição">Contribuição</a> •
  <a href="#-licença">Licença</a>
</p>

---

## 💻 Sobre o projeto

O **ProntuVet** foi desenvolvido para simplificar e modernizar o dia a dia de clínicas veterinárias. Através de uma interface amigável, médicos veterinários e recepcionistas podem gerenciar cadastros de pacientes, históricos médicos (prontuários), agendamentos e rotinas administrativas de forma centralizada e segura.

## ⚙️ Funcionalidades

- **Gestão de Pacientes e Tutores:** Cadastro completo de pets e seus respectivos donos.
- **Prontuário Eletrônico:** Registro de consultas, exames, vacinas e receituários.
- **Agendamento Inteligente:** Calendário interativo para marcação de consultas e retornos.
- **Controle Financeiro:** Acompanhamento de pagamentos, faturamento e fluxo de caixa. *(Remova se não houver)*
- **Dashboard Analítico:** Visão geral da clínica com métricas de atendimentos.

## 🛠 Tecnologias

As seguintes ferramentas foram usadas na construção do projeto:

**Frontend:**
- [React](https://pt-br.reactjs.org/) / [Next.js](https://nextjs.org/) *(Ajuste conforme o seu)*
- [Tailwind CSS](https://tailwindcss.com/) / [Styled-Components](https://styled-components.com/)
- [TypeScript](https://www.typescriptlang.org/)

**Backend:**
- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/pt-br/) / [NestJS](https://nestjs.com/) *(Ajuste conforme o seu)*
- [PostgreSQL](https://www.postgresql.org/) / [MongoDB](https://www.mongodb.com/)
- [Prisma](https://www.prisma.io/)

## 🚀 Como executar

Pré-requisitos: Você precisará ter o [Node.js](https://nodejs.org/en/) e o [Git](https://git-scm.com) instalados na sua máquina.

### 1. Clone este repositório
```bash
git clone [https://github.com/leonard0antonio/ProntuVet.git](https://github.com/leonard0antonio/ProntuVet.git)

```

### 2. Rodando o Backend

```bash
# Entre na pasta do backend
cd ProntuVet/backend

# Instale as dependências
npm install

# Crie um arquivo .env com base no .env.example e preencha suas variáveis
cp .env.example .env

# Execute as migrations do banco de dados (se houver)
npm run prisma migrate dev

# Inicie o servidor
npm run dev

```

> O servidor iniciará na porta: 3333

### 3. Rodando o Frontend

```bash
# Entre na pasta do frontend
cd ../frontend

# Instale as dependências
npm install

# Inicie a aplicação
npm run dev

```

> A aplicação estará disponível no seu browser em: http://localhost:3000

## 🤝 Contribuição

Contribuições são super bem-vindas! Siga os passos abaixo para contribuir:

1. Faça um **fork** do projeto.
2. Crie uma nova branch com as suas alterações: `git checkout -b my-feature`
3. Salve as alterações e crie uma mensagem de commit contando o que você fez: `git commit -m "feature: Minha nova feature"`
4. Envie as suas alterações: `git push origin my-feature`

---

Feito com 💙 por [Leonardo Antonio](https://github.com/leonard0antonio)
