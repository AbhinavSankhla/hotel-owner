'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BlogPost = sequelize.define(
    'BlogPost',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      hotelId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Hotels', key: 'id' },
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      coverImageUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'BlogPosts',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['hotelId', 'slug'] },
        { fields: ['hotelId', 'isPublished'] },
      ],
    }
  );

  BlogPost.associate = (models) => {
    BlogPost.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
    BlogPost.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
  };

  return BlogPost;
};
