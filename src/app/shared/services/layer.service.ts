import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {ConfigService} from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LayerService {

    layers: any = [];
    layer: any;  //current;
    private subject: any = {
        add: new Subject<any>(),
        remove: new Subject<any>(),
        refresh: new Subject<any>(),
        open: new Subject<any>(),            //open table
        close: new Subject<any>()
    };


    constructor() {
    }
    //激发添加图层事件
    add(layer: any) {
        this.layers.push(layer);
        this.emit("add", layer);
    }
    //激发移除图层事件
    remove(layer: any) {
        const index = this.layers.findIndex(item => item === layer);
        this.layers.splice(index, 1);
        this.emit("remove", layer);
    }
    //激发刷新图层事件
    refresh() {
        this.emit("refresh", this.layers);
    }
    //切换图层开关
    switch(layer) {
        if (layer.visible) {
            this.emit("add", layer);
        } else {
            this.emit("remove", layer);
        }
    }

    open(layer) {
        this.layer = layer;
        this.emit("open", layer);
    }

    close() {
        this.layer = null;
        this.emit("close", null);
    }
    //上移图层
    up(layer) {
        const index = this.layers.findIndex(item => item === layer);
        if (index > 0) {
            this.layers[index-1] = this.layers.splice(index, 1, this.layers[index-1])[0];
            this.emit("refresh", this.layers);
        }
    }
    //下移图层
    down(layer) {
        const index = this.layers.findIndex(item => item === layer);
        if (index < this.layers.length - 1) {
            this.layers[index+1] = this.layers.splice(index, 1, this.layers[index+1])[0];
            this.emit("refresh", this.layers);
        }
    }

    on(event, callback){
        return this.subject[event].subscribe( value => callback(value) );
    }

    emit(event, value: any) {
        return this.subject[event].next(value);
    }

}
