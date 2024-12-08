import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
} from 'typeorm';

export enum CallType {
  FORWARDED = 'forwarded',
  VOICEMAIL = 'voicemail',
}

export enum CallStatus {
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class Call {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
  })
  sid: string;

  @Column({
    type: 'enum',
    enum: CallType,
    nullable: true,
  })
  type: CallType;

  @Column({
    type: 'enum',
    enum: CallStatus,
    nullable: false,
    default: CallStatus.IN_PROGRESS,
  })
  status: CallStatus;

  @Column()
  to: string;

  @Column()
  from: string;

  @Column({
    type: 'int',
    default: 0,
  })
  duration: number;

  @Column({
    nullable: true,
  })
  voicemailUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property to calculate duration if it's 0
  get computedDuration(): number {
    console.log(this);
    if (this.duration === 0 && this.status === CallStatus.COMPLETED) {
      return Math.floor(
        (new Date(this.updatedAt).getTime() -
          new Date(this.createdAt).getTime()) /
          1000,
      );
    }
    return this.duration;
  }
  //   @BeforeUpdate()
  //   calculateDuration() {
  //     console.log(this, 'complete');
  //     // Automatically calculate duration if it's 0 and the call is completed
  //     if (this.duration == 0 && this.status === CallStatus.COMPLETED) {
  //       console.log(new Date(), new Date(this.createdAt));
  //       this.duration = Math.floor(
  //         (new Date().getTime() - new Date(this.createdAt).getTime()) / 1000,
  //       );
  //     }
  //   }
}
