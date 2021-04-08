import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConfigService} from "../../services/config.service";
import {LayerService} from '../../services/layer.service';

@Component({
    selector: 'arcgis-map-layer',
    templateUrl: './arcgis-map-layer.component.html',
    styleUrls: ['./arcgis-map-layer.component.scss']
})
export class ArcGISMapLayerComponent implements OnInit, OnDestroy {

    @Input() map: any;

    constructor(private configService: ConfigService, public layerService: LayerService) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {

    }

    /////////////////以下私有函数/////////////////////

    /////////////////以下界面交互/////////////////////

    switch(layer) {
        this.layerService.switch(layer);
    }

    remove(layer) {
        this.layerService.remove(layer);
    }

    up(layer) {
        this.layerService.up(layer);
    }

    down(layer) {
        this.layerService.down(layer);
    }


}
