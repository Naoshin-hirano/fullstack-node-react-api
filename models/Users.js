module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imageName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    Users.associate = (models) => {
        Users.hasMany(models.Likes, {
            onDelete: "cascade",
        });

        Users.hasMany(models.Posts, {
            onDelete: "cascade",
        });

        Users.hasMany(models.DirectMessages, {
            onDelete: "cascade",
        });

        Users.hasMany(models.Relationships, {
            onDelete: "cascade",
            foreignKey: "followed",
        });

        Users.hasMany(models.Relationships, {
            onDelete: "cascade",
            foreignKey: "following",
        });
    };

    return Users;
};
