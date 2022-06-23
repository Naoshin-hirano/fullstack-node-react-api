module.exports = (sequelize, DataTypes) => {
    const Posts = sequelize.define("Posts", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        postText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    })

    Posts.associate = (models) => {
        // 1:多 のテーブル関係
        Posts.hasMany(models.Comments, {
            // post(1)を削除したらそのコメントも全て削除される
            onDelete: "cascade",
        });
        
        Posts.hasMany(models.Likes, {
            // post(1)を削除したらそのコメントも全て削除される
            onDelete: "cascade",
        });
    }

    return Posts;
};