module.exports = (sequelize, DataTypes) => {
    const DirectMessages = sequelize.define("DirectMessages", {
        text: {
            type: DataTypes.STRING,
        },
        toUserId: {
            type: DataTypes.INTEGER,
        },
    });

    return DirectMessages;
};
