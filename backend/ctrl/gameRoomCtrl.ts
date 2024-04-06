import {NextFunction, Response, Request} from "express";
import {gameRoomRepository} from "../repositories";
import {GameRoom} from "@defferrard/algoo-core/src/game";

export function getRooms(req: Request, res: Response, next: NextFunction) {
    res.send(gameRoomRepository.rooms)
}

export function createRoom(req: Request, res: Response, next: NextFunction) {
    const ROOM: GameRoom = new GameRoom();
    gameRoomRepository.push(ROOM);
    res.send(ROOM);
}