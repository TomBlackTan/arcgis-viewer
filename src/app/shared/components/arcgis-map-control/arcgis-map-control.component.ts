import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import Map from '@arcgis/core/Map';
import Basemap from '@arcgis/core/Basemap';
import MapView from '@arcgis/core/views/MapView';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Point from '@arcgis/core/geometry/Point';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import {ConfigService} from "../../services/config.service";
import {LayerService} from '../../services/layer.service';

declare var AMap: any;

@Component({
  selector: 'arcgis-map-control',
  templateUrl: './arcgis-map-control.component.html',
  styleUrls: ['./arcgis-map-control.component.scss']
})
export class ArcGISMapControl implements OnInit, OnDestroy {

    @ViewChild('aMapDiv', {static:true}) aMapDiv: ElementRef;
    @ViewChild('lMapDiv', {static:true}) lMapDiv: ElementRef;
    @Input() option;
    @Output() mapInit = new EventEmitter<any>();
    view: MapView;
    map: Map;
    amap: any;

    constructor(private elRef: ElementRef, private configService: ConfigService, private layerService: LayerService) {

    }

    ngOnInit() {
        this.option = this.option || {};
        this.option.logo = this.option.hasOwnProperty('logo') ? this.option.logo : false;
        this.option.slider = this.option.hasOwnProperty('slider') ? this.option.slider : true;
        this.option.showLabels = this.option.hasOwnProperty('showLabels') ? this.option.showLabels : true;
        this.option.isScrollWheelZoom = this.option.hasOwnProperty('isScrollWheelZoom') ? this.option.isScrollWheelZoom : true;
        this.option.showLoading = this.option.hasOwnProperty('showLoading') ? this.option.showLoading : true;
        this.option.showImageMap = this.option.hasOwnProperty('showImageMap') ? this.option.showImageMap : false;
        this.option.showSatellite = this.option.hasOwnProperty('showSatellite') ? this.option.showSatellite : false;
        this.option.maxZoom = 20;
        this.option.minZoom = this.option.hasOwnProperty('minZoom') ? this.option.minZoom : 5;
        this.option.mapStyle = this.option.hasOwnProperty('mapStyle') ? this.option.mapStyle : "normal";

        this.amap = new AMap.Map(this.aMapDiv.nativeElement, {
            zoom: this.configService.config.map.zoom,
            center: [this.configService.config.map.center.lng, this.configService.config.map.center.lat],
            fadeOnZoom: false,
            navigationMode: 'classic',
            optimizePanAnimation: false,
            animateEnable: false,
            dragEnable: false,
            zoomEnable: false,
            resizeEnable: true,
            doubleClickZoom: false,
            keyboardEnable: false,
            scrollWheel: false,
            expandZoomRange: true,
            zooms: [3, 20],
            mapStyle: this.option.mapStyle || 'normal',
            features: this.option.features || ['road', 'point', 'bg'],
            viewMode: this.option.viewMode || '2D'
        });

        // 同时引入工具条插件，比例尺插件和鹰眼插件
        AMap.plugin([
            'AMap.Scale',
        ], () => {
            // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
            this.amap.addControl(new AMap.Scale());
        });

        const satellite = new AMap.TileLayer.Satellite();
        satellite.setMap(this.amap);

        if (!this.option.showSatellite) {
            satellite.hide();
            this.amap.setFeatures(this.option.features || ['road', 'point', 'bg']);
        }

        let baseLayer = new WebTileLayer({
            urlTemplate: "http://wprd{subDomain}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
            subDomains: ['01', '02', '03', '04'],
            opacity: 1

        });
        this.map = new Map({
            basemap: new Basemap({
                baseLayers: [baseLayer],
                spatialReference: new SpatialReference({
                    wkid: 102113
                })
            })
            /*basemap: "topo-vector"*/
        });
        this.view = new MapView({
            map: this.map,
            constraints: {
                minZoom: this.option.minZoom,
                maxZoom: this.option.maxZoom
            },
            spatialReference: new SpatialReference({
                wkid: 102113
            }),
            container: this.lMapDiv.nativeElement
        });

        /*this.view.on('mouse-wheel',   (evt) => {
            setTimeout(()=> {
                const pt = this.view.center;
                this.amap.setZoomAndCenter(this.view.zoom, [pt.longitude, pt.latitude]);
            }, 500);
        });

        this.view.on('pointer-up',   (evt) => {
            const pt = this.view.center;
            this.amap.setZoomAndCenter(this.view.zoom, [pt.longitude, pt.latitude]);
        });*/

        this.view.center = new Point({longitude: this.configService.config.map.center.lng, latitude: this.configService.config.map.center.lat});
        this.view.zoom = this.configService.config.map.zoom;
        //添加Shown属性来记录layer当前是否是显示状态，显示状态表明layer已添加到Map
        this.layerService.on("add", (layer) => {
            this.map.add(layer);
        });

        this.layerService.on("remove", (layer) => {

        });

        this.layerService.on("refresh", (layers) => {

        });

        this.mapInit.emit({
            view: this.view,
            map: this.map,
            amap: this.amap
        });

    }

    ngOnDestroy() {
        this.view && this.view.destroy();
        this.amap && this.amap.destroy();
    }
}
