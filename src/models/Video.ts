import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface VideoAttributes {
  id: string;
  title: string;
  description: string;
  url: string;
  platform: 'youtube' | 'vimeo' | 'loom';
  thumbnail_url: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  questionId?: string;
}

// Define os atributos que são opcionais na criação
type VideoCreationAttributes = Optional<VideoAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Video extends Model<VideoAttributes, VideoCreationAttributes> implements VideoAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public url!: string;
  public platform!: 'youtube' | 'vimeo' | 'loom';
  public thumbnail_url!: string;
  public category!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public questionId?: string;
}

Video.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    platform: {
      type: DataTypes.ENUM('youtube', 'vimeo', 'loom'),
      defaultValue: 'youtube',
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    questionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'videos',
    timestamps: true,
  }
);

export default Video;