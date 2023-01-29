let sequelize = require('sequelize');

const db = new sequelize('wt22', 'root', 'password', { logging: true, host: 'localhost', dialect: 'mysql'});

db.Nastavnik = db.define('Nastavnik', {
    username: {
        type: sequelize.STRING,
        primaryKey: true,
    },
    password_hash: {
        type: sequelize.STRING,
        required: true,
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

db.Predmet = db.define('Predmet', {
    naziv: {
        type: sequelize.STRING,
        primaryKey: true,
    },
    brojPredavanjaSedmicno: {
        type: sequelize.INTEGER,
        default: 0
    },
    brojVjezbiSedmicno: {
        type: sequelize.INTEGER,
        default: 0
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

db.NastavnikPredmet = db.define('Nastavnik_Predmet', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

db.Student = db.define('Student', {
    index: {
        type: sequelize.INTEGER,
        primaryKey: true,
    },
    ime: {
        type: sequelize.STRING,
        required: true
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

// Predstavlja da je student upisan na predmet, tabela nije prijeko potrebna
db.StudentPredmet = db.define('Student_Predmet', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

db.Prisustvo = db.define('Prisustvo', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sedmica: {
        type: sequelize.INTEGER,
        required: true,
    },
    predavanja: {
        type: sequelize.INTEGER,
        required: true,
    },
    vjezbe: {
        type: sequelize.INTEGER,
        required: true
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

db.Nastavnik.hasMany(db.NastavnikPredmet, {
    foreignKey: 'nastavnik'
});

db.Predmet.hasMany(db.NastavnikPredmet, {
    foreignKey: 'predmet'
});

db.Student.hasMany(db.StudentPredmet, {
    foreignKey: 'index',
});

db.Predmet.hasMany(db.StudentPredmet, {
    foreignKey: 'predmet'
});

db.Student.hasMany(db.Prisustvo, {
    foreignKey: 'index'
});

db.Predmet.hasMany(db.Prisustvo, {
    foreignKey: 'predmet'
});

module.exports = db;
