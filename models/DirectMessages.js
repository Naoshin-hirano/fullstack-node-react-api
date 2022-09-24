module.exports = (sequelize, DataTypes) => {
    const DirectMessages = sequelize.define("DirectMessages", {
        text: {
            type: DataTypes.STRING,
        },
    });

    return DirectMessages;
};
