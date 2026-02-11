import { Module, Global } from '@nestjs/common';
import { RequestGateway } from './request.gateway';
import { ChatGateway } from './chat.gateway';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
    imports: [ConfigModule, JwtModule],
    providers: [RequestGateway, ChatGateway],
    exports: [RequestGateway, ChatGateway],
})
export class WebSocketsModule { }
