import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Video from './Video';

export interface UserProgressAttributes {
  id: string;
  user_id: string;
  video_id: string;
  completed: boolean;
  coins_earned: number;
  created_at: Date;
  updated_at: Date;
}

class UserProgress extends Model<UserProgressAttributes> implements UserProgressAttributes {
  public id!: string;
  public user_id!: string;
  public video_id!: string;
  public completed!: boolean;
  public coins_earned!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

UserProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    video_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Video,
        key: 'id',
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    coins_earned: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_progress',
    timestamps: true,
    underscored: true,
  }
);

UserProgress.belongsTo(User, { foreignKey: 'user_id' });
UserProgress.belongsTo(Video, { foreignKey: 'video_id' });

export default UserProgress;