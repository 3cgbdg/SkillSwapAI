import { Module } from '@nestjs/common';
import { AutoAcceptTasks } from './auto-accept.tasks';

@Module({
  providers: [AutoAcceptTasks],
})
export class TasksModule {}
