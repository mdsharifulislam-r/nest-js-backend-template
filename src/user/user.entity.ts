import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, PrimaryColumn } from 'typeorm';
import { USER_ROLES } from 'src/utlils/enums/user';
import * as bcrypt from 'bcrypt';
import { config } from 'src/utlils/config/config';
import { hashPassword } from 'src/utlils/helper/bycrptHelper';
class Authentication {
  isResetPassword: boolean;
  oneTimeCode: number | null;
  expireAt: Date | null;
}

@Entity('users')
export class User {
  @PrimaryColumn()
  id: string;
  @BeforeInsert()
  generateId() {
    this.id = `user-${Math.floor(Math.random() * 1000000)}`;
  }

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: USER_ROLES,
    default: USER_ROLES.USER,
  })
  role: USER_ROLES;

  @Column({ nullable: true })
  contact: string;

  @Column({ unique: true })
  email: string;

  @Column({select: false})
  password: string;
  @BeforeInsert()
  async hashPassword() {
    if (!this.password) return;
    if (this.password.startsWith('$2b$')) return;
    this.password = hashPassword(this.password);
  }
  @Column({ nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: ['active', 'delete'],
    default: 'active',
  })
  status: 'active' | 'delete';

  @Column({ default: false })
  verified: boolean;

  @Column({
    type: 'json',
    nullable: true,
    select: false,
  })
  authentication: Authentication;
  @BeforeInsert()
  setBasicAuth() {
    if (!this?.authentication){
      this.authentication = {
        isResetPassword: false,
        oneTimeCode: null,
        expireAt: null,
      };
    }
  }

  // createAt and updateAt columns
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

@Entity('reset_token')
export class ResetToken{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    token: string;
    @Column()
    userId: string
}