import {createSVGIcon, handleKeyboardEvent} from "../Util";

import '../svg/maps.svg';
import {DomUtil} from "leaflet";
import {World} from "../module/World";
import SidebarTab from "./SidebarTab";
import {Pl3xMap} from "../Pl3xMap";
import {WorldRendererPair} from "../index";

interface WorldListItem {
    input: HTMLInputElement;
    label: HTMLLabelElement;

    //TODO: Refreshless config updates?
    icon?: HTMLImageElement;
    name: HTMLSpanElement;
}

export default class WorldsTab extends SidebarTab {
    private readonly _worlds: Map<World, WorldListItem> = new Map();
    private readonly _list: HTMLFieldSetElement;

    constructor(pl3xmap: Pl3xMap) {
        super(pl3xmap, 'worlds');

        this._button.appendChild(createSVGIcon('maps'));
        this._button.setAttribute('aria-label',pl3xmap.lang.worlds);

        const heading = DomUtil.create('h2', '', this._content);
        heading.innerText = pl3xmap.lang.worlds;
        heading.id = 'worlds-heading';

        this._list = DomUtil.create('fieldset', 'menu', this._content);
        this._list.setAttribute('aria-labelledby', 'worlds-heading');
        this._list.setAttribute('role', 'radiogroup');

        this.initEvents();
    }

    private initEvents() {
        addEventListener('worldadded', (e: CustomEvent<World>) => this.createListItem(e.detail));
        addEventListener('worldremoved', (e: CustomEvent<World>) => this.removeListItem(e.detail)); //TODO: Refreshless config updates?
        addEventListener('mapchanged', (e: CustomEvent<WorldRendererPair>) => {
            if(this._worlds.has(e.detail.world)) {
                console.log(this._worlds.get(e.detail.world)!.input.checked);
                this._worlds.get(e.detail.world)!.input.checked = true;
            }
        });

        this._list.addEventListener('keydown', (e: KeyboardEvent) =>
            handleKeyboardEvent(e, Array.from(this._list.elements) as HTMLElement[]))
    }

    private createListItem(world: World) {
        const input = DomUtil.create('input'),
            label = DomUtil.create('label'),
            //TODO Icon
            name = DomUtil.create('span', '', label);

        name.innerText = world.displayName;
        input.id = label.htmlFor = `world-${world.name}`;
        input.type = 'radio';
        input.name = 'world';
        input.checked = false;
        input.addEventListener('click', async (e: MouseEvent) => {
            this._pl3xmap.setCurrentMap(world).catch(() => {
                e.preventDefault(); //Don't update radio button if switch fails
            });
        });

        this._worlds.set(world, {
            input,
            label,
            name,
        });

        this._list.appendChild(input);
        this._list.appendChild(label);
    }

    private removeListItem(world: World) {
        const listItem = this._worlds.get(world);

        if(!listItem) {
            return;
        }

        listItem.label.remove();
        listItem.input.remove();
        this._worlds.delete(world);
    }

    onActivate() {
        (this._list.querySelector('input:checked') as HTMLElement)!.focus();
    }
}
