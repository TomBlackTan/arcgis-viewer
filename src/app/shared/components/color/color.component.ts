import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

@Component({
    selector: 'app-color',
    templateUrl: './color.component.html',
    styleUrls: ['./color.component.scss']
})
export class ColorComponent implements OnInit, OnChanges {

    @Output() valueChange = new EventEmitter();

    @Input() name: string;
    @Input() value: string;

    color: string;
    opacity: number;

    constructor() {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.value && changes.value.currentValue) {
            this.rgba2Hex(this.value);
        }
    }

    change() {
        const [r,g,b] = this.hex2Rgba(this.color);
        //this.value = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, "0");
        this.value = "rgba(" + r + "," + g + "," + b + "," + this.opacity + ")";
        this.valueChange.emit(this.value);
    }


    rgba2Hex(rgba) {
        if (rgba && rgba.startsWith('rgba')) {
            rgba = rgba.split(',');
            let r = parseInt(rgba[0].split('(')[1]);
            let g = parseInt(rgba[1]);
            let b = parseInt(rgba[2]);
            let a = parseFloat(rgba[3].split(')')[0]);
            this.color = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            this.opacity = a;
        } else if (rgba && rgba.startsWith('rgb')) {
            rgba = rgba.split(',');
            let r = parseInt(rgba[0].split('(')[1]);
            let g = parseInt(rgba[1]);
            let b = parseInt(rgba[2].split(')')[0]);
            this.color = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            this.opacity = 1;
        }  else if (rgba && rgba.startsWith('#')) {
            if (rgba.length == 9) {
                this.color = rgba.substring(0, 7);
                this.opacity = parseInt(rgba.substring(7), 16) / 255;
            } else {
                this.color = rgba;
                this.opacity = 1;
            }
        }
    }

    hex2Rgba(hex: string) {
        let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/;
        hex = hex.toLowerCase();
        if (hex && reg.test(hex)) {
            //处理三位的颜色值
            if (hex.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += hex.slice(i, i + 1).concat(hex.slice(i, i + 1));
                }
                hex = sColorNew;
            }
            //处理六位的颜色值
            if (hex.length === 7) {
                hex += "ff";
            }
            let sColorChange = [];
            for (let i = 1; i < 9; i += 2) {
                sColorChange.push(parseInt("0x" + hex.slice(i, i + 2)));
            }
            return [sColorChange[0], sColorChange[1], sColorChange[2], sColorChange[3]/255];
        }
    }

}
