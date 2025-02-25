import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../user/entities/user.entity'

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  token: string

  @Column({ type: 'timestamp' })
  expiresAt: Date

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: 'varchar', length: 36 })
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ default: false })
  isRevoked: boolean
}
