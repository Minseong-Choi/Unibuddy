import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'https';
import url from 'url';

interface Room {
    clients: WebSocket[];
    turn: number;
}

export const rooms: { [key: string]: Room } = {};
const readyStatus: { [key: string]: { [key: number]: boolean } } = {};
const restartVotes: { [key: string]: { [key: number]: boolean } } = {};

export const createWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket, req) => {
        const queryObject = url.parse(req.url || '', true).query;
        const roomId = queryObject.room as string;

        // 유효한 roomId가 없거나, 존재하지 않는 방에 접속 시도 시 연결 거부
        if (!roomId || !rooms[roomId]) {
            console.log(`Connection failed: Invalid roomId: ${roomId}`);
            ws.send(JSON.stringify({ type: "error", message: "Invalid room code." }));
            ws.close();
            return;
        }

        if (rooms[roomId].clients.length >= 2) {
            ws.send(JSON.stringify({ type: "error", message: "Room is full." }));
            ws.close();
            return;
        }

        rooms[roomId].clients.push(ws);
        const playerNumber = rooms[roomId].clients.length;

        ws.send(JSON.stringify({ type: "welcome", player: playerNumber }));

        ws.on('message', (message: string) => {
            const msg = JSON.parse(message);
            const currentRoom = rooms[roomId];

            if (!currentRoom) return;

            // 모든 클라이언트에게 메시지를 브로드캐스트하는 함수
            const broadcast = (data: any) => {
                currentRoom.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            };

            // 특정 클라이언트를 제외하고 브로드캐스트하는 함수
            const broadcastExclude = (data: any, excludeWs: WebSocket) => {
                currentRoom.clients.forEach(client => {
                    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            };

            switch (msg.type) {
                case "ready":
                    if (!readyStatus[roomId]) readyStatus[roomId] = {};
                    readyStatus[roomId][playerNumber] = true;

                    if (Object.keys(readyStatus[roomId]).length === 2) {
                        broadcast({ type: "start" });
                        broadcast({ type: "turn", next: 1 });
                    }
                    break;

                case "turn":
                    // 턴을 전환하고 모든 클라이언트에게 알림
                    currentRoom.turn = msg.next;
                    broadcast(msg);
                    break;

                case "restart":
                    if (!restartVotes[roomId]) restartVotes[roomId] = {};
                    restartVotes[roomId][playerNumber] = true;

                    if (Object.keys(restartVotes[roomId]).length === 2) {
                        broadcast({ type: "restartConfirmed" });
                        // 재시작 메시지를 보낸 후, 방 정보를 완전히 초기화합니다.
                        rooms[roomId].clients = [];
                        delete readyStatus[roomId];
                        delete restartVotes[roomId];
                    }
                    break;

                default:
                    // 'turn'을 제외한 다른 모든 메시지는 보낸 사람을 제외하고 릴레이
                    broadcastExclude(msg, ws);
                    break;
            }
        });

        ws.on('close', () => {
            if (!roomId || !rooms[roomId]) return;

            // 1. 현재 연결(ws)을 clients 목록에서 제거
            rooms[roomId].clients = rooms[roomId].clients.filter(c => c !== ws);

            // 2. 방에 남은 클라이언트 수 확인
            const remainingClients = rooms[roomId].clients;

            if (remainingClients.length === 0) {
                // 3. 아무도 안 남았으면 방과 관련 데이터 전부 삭제
                delete rooms[roomId];
                delete readyStatus[roomId];
                delete restartVotes[roomId];
                console.log(`Room ${roomId} deleted (no clients left)`);
            } else {
                // 4. 상대방에게 '상대가 나감' 메시지 전송
                remainingClients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "error",
                            message: "상대가 게임을 나갔습니다."
                        }));
                        client.send(JSON.stringify({
                            type: "gameOver",
                            loser: playerNumber
                        }));
                    }
                });

                console.log(`Client disconnected from room ${roomId}. One player remains.`);
            }
        });
    });
};
