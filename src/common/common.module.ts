import { Module } from '@nestjs/common';
import { AxiosAdapter } from './httpAdapters/axios.adapter';

@Module({
    providers: [ AxiosAdapter ],
    exports: [ AxiosAdapter ]
})
export class CommonModule {}
