module.exports = (sequelize, DataTypes) => {
    const Tags = sequelize.define("Tags", {
        tag_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Tags.associate = (models) => {
        Tags.belongsToMany(models.Posts, {
            through: "PostTag",
        });
    };

    return Tags;
};
