import * as L from "leaflet";
import {Pl3xMap} from "../Pl3xMap";
import {Circle} from "../marker/Circle";
import {Ellipse} from "../marker/Ellipse";
import {Icon} from "../marker/Icon";
import {MultiPolygon} from "../marker/MultiPolygon";
import {MultiPolyline} from "../marker/MultiPolyline";
import {Polygon} from "../marker/Polygon";
import {Polyline} from "../marker/Polyline";
import {Rectangle} from "../marker/Rectangle";
import {Marker, Type} from "../marker/Marker";
import {MarkerOptions, Options} from "../marker/options/MarkerOptions";
import {World} from "../world/World";
import {fireCustomEvent, getJSON, getOrCreatePane, insertCss, isset, removeCss} from "../util/Util";

interface MarkerData {
    type: string;
    data: unknown[];
    options: Options;
}

export class MarkerLayer extends L.LayerGroup {
    private static readonly TYPES = {
        "circ": (type: Type) => new Circle(type),
        "elli": (type: Type) => new Ellipse(type),
        "icon": (type: Type) => new Icon(type),
        "multipoly": (type: Type) => new MultiPolygon(type),
        "multiline": (type: Type) => new MultiPolyline(type),
        "poly": (type: Type) => new Polygon(type),
        "line": (type: Type) => new Polyline(type),
        "rect": (type: Type) => new Rectangle(type)
    }

    declare options: L.LayerOptions;

    private readonly _key: string;
    private readonly _label: string;
    private readonly _updateInterval: number;
    private readonly _showControls: boolean;
    private readonly _defaultHidden: boolean;
    private readonly _priority: number;
    private readonly _zIndex: number;
    private readonly _pane: string;
    private readonly _css: string;

    private readonly _markers: Map<string, Marker> = new Map();

    private _timer: NodeJS.Timeout | undefined;

    constructor(key: string, label: string, interval: number, showControls: boolean, defaultHidden: boolean, priority: number, zIndex: number, pane: string, css: string) {
        super(undefined, {
            attribution: undefined
        });
        this._key = key;
        this._label = label;
        this._updateInterval = (interval < 1 ? 1 : interval) * 1000;
        this._showControls = showControls;
        this._defaultHidden = defaultHidden;
        this._priority = priority;
        this._zIndex = zIndex;
        this._pane = pane;
        this._css = css;

        this.setZIndex(zIndex);

        if (isset(pane)) {
            const dom = getOrCreatePane(pane);
            dom.style.zIndex = String(zIndex);
            this.options.pane = dom.className.split("-")[1];
        }

        if (isset(css)) {
            insertCss(css, key);
        }

        fireCustomEvent("overlayadded", this);
    }

    get key(): string {
        return this._key;
    }

    get label(): string {
        return this._label;
    }

    get updateInterval(): number {
        return this._updateInterval;
    }

    get showControls(): boolean {
        return this._showControls;
    }

    get defaultHidden(): boolean {
        return this._defaultHidden;
    }

    get priority(): number {
        return this._priority;
    }

    get zIndex(): number {
        return this._zIndex;
    }

    get pane(): string {
        return this._pane;
    }

    get css(): string {
        return this._css;
    }

    update(world: World): void {
        //console.log("Update markers: " + this._name + " " + this._world.name);

        getJSON(`tiles/${world.name}/markers/${this._key}.json`)
            .then((json) => {
                //this.clearLayers();
                const toRemove: Set<string> = new Set(this._markers.keys());


                for (const index in Object.keys(json)) {
                    const existing = this._markers.get(json[index].data.key);
                    if (existing) {
                        // update
                        const data = json[index];
                        const options = isset(data.options) ? new MarkerOptions(data.options) : undefined;
                        existing.update(data.data, options);
                        // do not remove this marker
                        toRemove.delete(existing.key);
                    } else {
                        // new marker
                        const marker = this.parseMarker(json[index]);
                        if (marker) {
                            this._markers.set(marker.key, marker);
                            marker.marker.addTo(this);
                            // inform the events
                            fireCustomEvent('markeradded', marker);
                        }
                    }
                }

                toRemove.forEach(key => {
                    // remove players not in updated settings file
                    const marker = this._markers.get(key);
                    if (marker) {
                        this._markers.delete(key);
                        marker.marker.remove();
                        fireCustomEvent('markerremoved', marker);
                    }
                });

                this._timer = setTimeout(() => this.update(world), this._updateInterval);
            });
    }

    unload(): void {
        clearTimeout(this._timer);
        removeCss(this._key);
        this.clearLayers();
        this.removeFrom(Pl3xMap.instance.map);
        fireCustomEvent("overlayremoved", this);
    }

    private parseMarker(data: MarkerData): Marker | undefined {
        const options = isset(data.options) ? new MarkerOptions(data.options) : undefined;

        const type = MarkerLayer.TYPES[data.type as keyof typeof MarkerLayer.TYPES];
        const marker = type ? type(new Type(data.data as unknown[], options)) : undefined;

        if (marker?.marker) {
            const popup = options?.popup;
            const tooltip = options?.tooltip;
            if (popup) {
                marker.marker.bindPopup(() => popup.content, popup.properties);
            }
            if (tooltip) {
                marker.marker.bindTooltip(() => tooltip.content, tooltip.properties);
            }
        }

        return marker;
    }
}
