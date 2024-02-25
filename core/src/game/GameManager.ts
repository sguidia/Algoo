import type {Coordinate} from "../board/";
import type {Resources, Spell} from "./";
import {TileType, Entity, Board} from "../board/";
import {HeroEntity, ResourceType, Team} from "./";
import {TeamAlreadyExistsException, TeamNotEmptyException, TeamNotExistsException} from "../exceptions";
import {InvalidEntityException} from "../exceptions/gameManager";
import {ActionResume} from "../strategy";

export function generateRandomBoard(width: number, height: number, wallProbability: number): TileType[][] {
    let map: TileType[][] = [];
    for (let y = 0; y < height; y++) {
        map[y] = new Array(width);
        for (let x = 0; x < width; x++) {
            map[y][x] = Math.random() < wallProbability ? TileType.Wall : TileType.Floor;
        }
    }

    return map;
}

export default class GameManager {
    // Whether the client is currently animating.
    // TODO : Use a buffer !
    private readonly _board: Board;
    private _turnIndex: number = 0;
    private _teams: Team[] = [];
    private _entities: { [key in string]: Entity<Resources> } = {};

    constructor(tiles: TileType[][]) {
        this._board = new Board(tiles);
    }

    pushTeam(team: Team): void {
        if (this._teams.find(t => t.uuid === team.uuid)) throw new TeamAlreadyExistsException(team);
        if (team.entities.length > 0) throw new TeamNotEmptyException(team);
        this._teams.push(team);
    }

    pushEntity(entity: Entity<Resources>, coordinate: Coordinate): void {
        if (!entity.team) throw new InvalidEntityException(entity);

        const TEAM = this._teams.find(t => t.uuid === entity.team?.uuid)!;
        if (!TEAM) throw new TeamNotExistsException(TEAM);

        this._board.pushEntity(entity, coordinate);
        TEAM.pushEntity(entity);
    }

    moveEntity(entity: Entity<Resources>, path: Coordinate[]): void {
        if (!Object.hasOwn(entity.resources, ResourceType.STAMINA)) throw new InvalidEntityException(entity);

        while (path.length > 0) {
            let coordinate: Coordinate = path.pop()!;
            this.moveEntityTo(entity, coordinate);
        }
    }

    protected moveEntityTo(entity: Entity<Resources>, coordinate: Coordinate): void {
        this._board.moveEntity(entity, coordinate);
        entity.resources[ResourceType.STAMINA]! += this._board.getTile(coordinate).movementCost;
    }

    deleteEntity(entity: Entity<Resources>): void {
        this._teams.find(t => t.entities.find(e => e.uuid === entity.uuid)!)!.deleteEntity(entity);
        this._board.deleteEntity(entity);
    }

    castSpell(spell:Spell, coordinate: Coordinate): ActionResume[] {
        const CASTER: Entity<Resources> = this.currentHero!
        return spell.cast(CASTER, this.board.getEntityCoordinate(CASTER), coordinate, this.board);
    }

    nextTurn(): void {
        // TODO : Better Event Handler
        (this.currentHero as HeroEntity).onEndTurn();
        this._turnIndex++;
    }

    get currentHero(): Entity<Resources> | undefined {
        if (this._teams.length <= 0) return undefined;
        const TEAM_INDEX = this._turnIndex % this._teams.length;
        if (this._teams[TEAM_INDEX].entities.length <= 0) return undefined;
        const HERO_INDEX = Math.floor(this._turnIndex / this._teams.length % this._teams[TEAM_INDEX].entities.length);
        return this._teams[TEAM_INDEX].entities[HERO_INDEX];
    }

    get board(): Board {
        return this._board;
    }
}