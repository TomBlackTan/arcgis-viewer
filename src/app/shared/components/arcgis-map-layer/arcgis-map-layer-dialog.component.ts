import {ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {LayerService} from '../../services/layer.service';
import {Color} from '../../classes/color';
import LabelClass from '@arcgis/core/layers/support/LabelClass';

@Component({
    selector: 'arcgis-map-layer-dialog',
    templateUrl: './arcgis-map-layer-dialog.component.html',
    styleUrls: ['./arcgis-map-layer-dialog.component.scss']
})
export class ArcGISMapLayerDialogComponent implements OnInit {
    private ribbonCanvasRef: ElementRef;
    @ViewChild('ribbonCanvas', { static: false }) set ribbonCanvas(elRef: ElementRef) {
        this.ribbonCanvasRef = elRef;
        this.ribbon();
    }
    @Output() onSave = new EventEmitter();
    @Output() onCancel = new EventEmitter();

    option: any = {
        label: {
            fonts :['YaHei','微软雅黑','宋体','新宋体','幼圆','楷体','隶书','黑体','华文仿宋','华文中宋'],
            sizes :[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
        },
        renderer: {
            method: 0,
            /*simple: new SimpleRenderer(),
            category: new CategoryRenderer(),
            class: new ClassRenderer(),*/
            field: null,
            start_color: "#ff0000",
            end_color: "#0000ff",
            classes: 5
        }
    };

    source: any;
    layer: any;
    shown: boolean;

    constructor(private layerService: LayerService, private message: NzMessageService, private modal: NzModalService) {
    }

    ngOnInit() {
    }

    /////////////////以下私有函数/////////////////////


    /////////////////以下界面交互/////////////////////


    show(layer){
        this.option = {
            label: {
                fonts :['微软雅黑','宋体','新宋体','幼圆','楷体','隶书','黑体','华文仿宋','华文中宋'],
                sizes :[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
            },
            renderer: {
                method: 0,
                simple: {},
                category: {},
                class: {},
                field: null,
                start_color: "#ff0000",
                end_color: "#0000ff",
                classes: 5
            }
        };
        this.source = layer;
        this.layer = Object.assign({}, this.source);
        this.layer.title = this.source.title;
        this.layer.description = this.source.description;
        this.layer.minScale = this.source.minScale;
        this.layer.maxScale = this.source.maxScale;
        this.layer.fields = this.source.fields;
        this.layer.labeled = this.source.labeled;
        this.layer.label = this.source.label || {
            field: {},
            symbol: {
                fontFamily: "宋体",
                fontSize: 10,
                fillStyle: "#ffffff",
                fontColor: "#000000"
            }
        };

        this.option.renderer.simple = {
            symbol: {
                fillStyle: "rgba(252, 146, 31, 0.76)",
                strokeStyle: "rgba(255, 255, 255, 0.7)",
                opacity: 1,
                lineWidth: 1,
                radius: 6
            }
        };
        this.layer.thematic = this.source.thematic || this.option.renderer.simple;
        if (this.layer.thematic.method == 1) {
            this.option.renderer.method = 1;
            this.option.renderer.category = this.layer.thematic;
            this.option.renderer.field = this.layer.thematic.field;
        } else if (this.layer.thematic.method == 2) {
            this.option.renderer.method = 2;
            this.option.renderer.class = this.layer.thematic;
            this.option.renderer.field = this.layer.thematic.field;
        } else {
            this.option.renderer.method = 0;
            this.option.renderer.simple = this.layer.thematic;
        }
        this.shown = true;
    }

    save(){
        Object.assign(this.source, this.layer);
        this.source.minScale = this.layer.minScale;
        this.source.maxScale = this.layer.maxScale;

        this.source.label = this.layer.label;
        if (this.option.renderer.method == 1) {
            this.layer.thematic = this.option.renderer.category;
        } else if (this.option.renderer.method == 2) {
            this.layer.thematic = this.option.renderer.class;
        } else {
            this.layer.thematic = this.option.renderer.simple;
        }
        this.layer.thematic.method = this.option.renderer.method;
        this.source.thematic = this.layer.thematic;
        this.shown = false;
        //label
        if (this.source.labeled) {
            this.source.labelsVisible = true;
            this.source.labelingInfo = [{
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: this.source.label.symbol.fontColor,
                    font: {  // autocast as new Font()
                        family: this.source.label.symbol.fontFamily,
                        size: this.source.label.symbol.fontSize
                    }
                },
                labelExpressionInfo: {
                    expression: "$feature." + this.source.label.field.name
                }
            }];
        } else {
            this.source.labelsVisible = false;
            this.source.labelingInfo = null;
        }

        //renderer
        let type;
        if (this.source.geometryType == "point" ) {
            type = "simple-marker";
        } else  if (this.source.geometryType == "polyline" ) {
            type = "simple-line";
        } else  if (this.source.geometryType == "polygon" ) {
            type = "simple-fill";
        }
        if (this.option.renderer.method == 1) {
            this.source.renderer = {
                type: "unique-value",  // autocasts as new UniqueValueRenderer()
                field: this.option.renderer.field.name,
                defaultSymbol: { type: type },  // autocasts as new SimpleFillSymbol()
                uniqueValueInfos: this.option.renderer.category.items.map(item => {
                    return {
                        value: item.value,
                        symbol: {
                            type: type,  // autocasts as new SimpleFillSymbol()
                            color: item.symbol.fillColor,
                            width: item.symbol.weight,
                            outline: {  // autocasts as new SimpleLineSymbol()
                                width: item.symbol.weight,
                                color: item.symbol.color
                            }
                        }
                    }
                })
            };
        } else if (this.option.renderer.method == 2) {
            this.source.renderer = {
                type: "class-breaks",  // autocasts as new UniqueValueRenderer()
                field: this.option.renderer.field.name,
                defaultSymbol: { type: type },  // autocasts as new SimpleFillSymbol()
                classBreakInfos: this.option.renderer.class.items.map(item => {
                    return {
                        minValue: item.low,
                        maxValue: item.high,
                        symbol: {
                            type: type,  // autocasts as new SimpleFillSymbol()
                            color: item.symbol.fillColor,
                            width: item.symbol.weight,
                            outline: {  // autocasts as new SimpleLineSymbol()
                                width: item.symbol.weight,
                                color: item.symbol.color
                            }
                        }
                    }
                })
            };
        } else {
            this.source.renderer = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: {
                    type: type,  // autocasts as new SimpleMarkerSymbol()
                    size: this.option.renderer.simple.symbol.radius,
                    color: this.option.renderer.simple.symbol.fillStyle,
                    width: this.option.renderer.simple.symbol.lineWidth,
                    outline: {  // autocasts as new SimpleLineSymbol()
                        width: this.option.renderer.simple.symbol.lineWidth,
                        color: this.option.renderer.simple.symbol.strokeStyle
                    }
                }
            }
            /*if (this.source.geometryType == "point" ) {
                this.source.renderer = {
                    type: "simple",  // autocasts as new SimpleRenderer()
                    symbol: {
                        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                        size: this.option.renderer.simple.symbol.radius,
                        color: this.option.renderer.simple.symbol.fillStyle,
                        outline: {  // autocasts as new SimpleLineSymbol()
                            width: this.option.renderer.simple.symbol.lineWidth,
                            color: this.option.renderer.simple.symbol.strokeStyle
                        }
                    }
                }
            } else  if (this.source.geometryType == "polyline" ) {
                this.source.renderer = {
                    type: "simple",  // autocasts as new SimpleRenderer()
                    symbol: {
                        type: "simple-line",  // autocasts as new SimpleMarkerSymbol()
                        width: this.option.renderer.simple.symbol.lineWidth,
                        color: this.option.renderer.simple.symbol.strokeStyle
                    }
                }
            } else  if (this.source.geometryType == "polygon" ) {
                this.source.renderer = {
                    type: "simple",  // autocasts as new SimpleRenderer()
                    symbol: {
                        type: "simple-fill",  // autocasts as new SimpleMarkerSymbol()
                        color: this.option.renderer.simple.symbol.fillStyle,
                        outline: {  // autocasts as new SimpleLineSymbol()
                            width: this.option.renderer.simple.symbol.lineWidth,
                            color: this.option.renderer.simple.symbol.strokeStyle
                        }
                    }
                }
            }*/
        }
        /*if (this.source.labeled) {
            this.source.eachLayer(layer => {
                layer.unbindTooltip();
                const html = `<span style='background-color: ${this.source.label.symbol.fillStyle}; color: ${this.source.label.symbol.fontColor}; font-family: ${this.source.label.symbol.fontFamily}; font-size: ${this.source.label.symbol.fontSize}px;'>${layer.feature.properties[this.source.label.field.name]}</span>`;
                layer.bindTooltip(html, {permanent: true});
            });
        } else {
            this.source.eachLayer(layer => {
                layer.unbindTooltip();
            });
        }
        this.source.eachLayer(layer => {
            if (this.option.renderer.method == 1) {
                const item = this.option.renderer.category.items.find(item => item.value == layer.feature.properties[this.option.renderer.field.name]);
                layer.setStyle(item.symbol);
            } else if (this.option.renderer.method == 2) {
                const item = this.option.renderer.class.items.find(item => item.low <= layer.feature.properties[this.option.renderer.field.name] && item.high >= layer.feature.properties[this.option.renderer.field.name]);
                layer.setStyle(item.symbol);
            } else {
                layer.setStyle({
                    fillColor: this.option.renderer.simple.symbol.fillColor,
                    fillOpacity: this.option.renderer.simple.symbol.fillOpacity,
                    color: this.option.renderer.simple.symbol.color,
                    opacity: this.option.renderer.simple.symbol.opacity,
                    weight: this.option.renderer.simple.symbol.lineWidth,
                    radius: this.option.renderer.simple.symbol.radius
                });
            }
        })*/
        this.layerService.refresh();
    }

/*    addField() {
        this.layer.featureClass.addField(new Field());
    }

    removeField(field) {
        this.layer.featureClass.removeField(field);
    }*/

    changeRenderer() {
        if (this.option.renderer.method == 1) {
            this.option.renderer.field = this.option.renderer.category.field;
        } else if (this.option.renderer.method == 2) {
            this.option.renderer.field = this.option.renderer.class.field;
        } else {
            this.option.renderer.field = null;
        }
    }

    ribbon() {
        if (!this.ribbonCanvasRef) return;
        const canvas = this.ribbonCanvasRef.nativeElement;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0,0,canvas.width,0);
        gradient.addColorStop(0, this.option.renderer.start_color);
        gradient.addColorStop(1, this.option.renderer.end_color);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    getRGB( color ) {
        color = color || '#ff0000';
        //十六进制颜色值的正则表达式
        const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        // 如果是16进制颜色
        if (color && reg.test(color)) {
            if (color.length === 4) {
                let sColorNew = "#";
                for (let i=1; i<4; i+=1) {
                    sColorNew += color.slice(i, i+1).concat(color.slice(i, i+1));
                }
                color = sColorNew;
            }
            //处理六位的颜色值
            const sColorChange = [];
            for (let i=1; i<7; i+=2) {
                sColorChange.push(parseInt("0x"+color.slice(i, i+2)));
            }
            return sColorChange;
        }
        return [255,0,0];
    };

    createCategories(){
        if (!this.option.renderer.field) return;
        this.option.renderer.category = {
            field: this.option.renderer.field,
            items : []
        };

        this.source.queryFeatures().then( (results) => {
            results.features.map(feature => feature.attributes[this.option.renderer.field.name]).forEach( (value) => {
                const item = this.option.renderer.category.items.find(item => item.value == value);
                if (item) {
                    item.count += 1;
                } else {
                    this.option.renderer.category.items.push({
                        symbol: {
                            fillColor: Color.random().toString(),
                            color: Color.random().toString(),
                            weight: 1,
                            radius: 6
                        },
                        value: value,
                        count: 1
                    });
                }
            });

            const start = this.getRGB(this.option.renderer.start_color);
            const end = this.getRGB(this.option.renderer.end_color);
            const array =  this.option.renderer.category.items;
            const red = array.length > 1 ? Array.from({length: array.length}, (v, i) => Math.round(start[0] + (end[0] - start[0]) / (array.length - 1) * i) ) : [start[0]];
            const green = array.length > 1 ? Array.from({length: array.length}, (v, i) => Math.round(start[1] + (end[1] - start[1]) / (array.length - 1) * i) ) : [start[1]];
            const blue = array.length > 1 ? Array.from({length: array.length}, (v, i) => Math.round(start[2] + (end[2] - start[2]) / (array.length - 1) * i) ) : [start[2]];
            this.option.renderer.category.items.forEach((item, i) => {
                item.label = item.value;
                item.symbol.fillColor = item.symbol.color =  '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0");
            })
        });
    }

    createClasses() {
        if (!this.option.renderer.field) return;
        this.option.renderer.class = {
            field: this.option.renderer.field,
            items : []
        };
        //获取该字段极值
        this.source.queryFeatures().then( (results) => {
            const stat = results.features.map(feature => feature.attributes[this.option.renderer.field.name]).reduce((stat, cur) => {
                stat.max = Math.max(cur, stat.max);
                stat.min = Math.min(cur, stat.min);
                return stat;
            },{min: Number.MAX_VALUE, max: Number.MIN_VALUE});
            for(let i = 0; i < this.option.renderer.classes; i++ ) {
                this.option.renderer.class.items.push({
                    symbol: {
                        fillColor: Color.random().toString(),
                        color: Color.random().toString(),
                        weight: 1,
                        radius: 6
                    },
                    low: stat.min + i * (stat.max - stat.min) / this.option.renderer.classes,
                    high: stat.min + (i+1) * (stat.max - stat.min) / this.option.renderer.classes
                });
            }
            const start = this.getRGB(this.option.renderer.start_color);
            const end = this.getRGB(this.option.renderer.end_color);
            const array =  this.option.renderer.class.items;
            const red = array.length > 1 ? Array.from({length: array.length}, (v, i) => Math.round(start[0] + (end[0] - start[0]) / (array.length - 1) * i) ) : [start[0]];
            const green = array.length > 1 ? Array.from({length: array.length}, (v, i) => Math.round(start[1] + (end[1] - start[1]) / (array.length - 1) * i) ) : [start[1]];
            const blue = array.length > 1 ? Array.from({length: array.length}, (v, i) => Math.round(start[2] + (end[2] - start[2]) / (array.length - 1) * i) ) : [start[2]];
            this.option.renderer.class.items.forEach((item, i) => {
                item.label = item.low + " - " + item.high;
                item.symbol.fillColor = item.symbol.color =  '#' + red[i].toString(16).padStart(2, "0") + green[i].toString(16).padStart(2, "0") + blue[i].toString(16).padStart(2, "0");
            })
        });
    }

    compareElement(g1: any, g2: any): boolean {
        return g1 && g2 ? g1.name === g2.name : g1 === g2;
    }

    hide() {
        this.shown = false;
    }
}
