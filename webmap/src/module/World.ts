import {Pl3xMap} from "../Pl3xMap";
import {Spawn} from "./Spawn";
import {Zoom} from "./Zoom";
import {WorldJSON, WorldListJSON} from "../types/Json";

export class World {
    private readonly _pl3xmap: Pl3xMap;

    private readonly _name: string = 'world';
    private readonly _displayName: string = 'World';
    private readonly _icon: string = '';
    private readonly _type: string = 'overworld';
    private readonly _order: number = 0;

    private _spawn: Spawn = new Spawn(0, 0);
    private _zoom: Zoom = new Zoom(0, 0, 0);
    private _renderers: string[] = ['basic'];
    private _loaded = false;

    constructor(pl3xmap: Pl3xMap, data: WorldListJSON) {
        this._pl3xmap = pl3xmap;
        this._name = data.name;
        this._displayName = data.display_name;
        this._icon = data.icon;
        this._type = data.type;
        this._order = data.order;
    }

    public load(): Promise<World> {
        if(this._loaded) {
            return Promise.resolve(this);
        }

        //TODO: Handle errors
        return new Promise((resolve) => {
            this._pl3xmap.getJSON(`tiles/${this.name}/settings.json`).then((json: WorldJSON) => {
                this._loaded = true;
                this.init(json);
                resolve(this);
            });
        });
    }

    private init(json: WorldJSON): void {
        this._spawn = new Spawn(json.spawn.x ?? this.spawn.x, json.spawn.z ?? this.spawn.z);
        this._zoom = new Zoom(
            json.zoom.default ?? this.zoom.default,
            json.zoom.max_out ?? this.zoom.maxOut,
            json.zoom.max_in ?? this.zoom.maxIn);
        this._renderers = json.renderers ?? this._renderers;
    }

    get name(): string {
        return this._name;
    }

    get displayName(): string {
        return this._displayName;
    }

    get icon(): string {
        return this._icon;
    }

    get type(): string {
        return this._type;
    }

    get order(): number {
        return this._order;
    }

    get renderers(): string[] {
        return this._renderers;
    }

    get spawn(): Spawn {
        return this._spawn;
    }

    get zoom(): Zoom {
        return this._zoom;
    }

    get format(): string {
        return this._pl3xmap.options.format;
    }
}
