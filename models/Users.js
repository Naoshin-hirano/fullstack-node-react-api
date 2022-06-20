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
    });

    Users.associate = (models) => {
        // 1:多 のテーブル関係
        // Postsテーブルに自動的にusernameカラムが追加される
        Users.hasMany(models.Posts, {
            // post(1)を削除したらそのコメントも全て削除される
            onDelete: "cascade",
        });
    }

    return Users;
};