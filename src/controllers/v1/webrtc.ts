import BaseController from '../base';

const STATES = {
    new: 0,
    offered: 1,
    answered: 2,
    icing: 3,
    connected: 4,
};

type store = {
    room: {
        participants: Set<string>,
        offeredBy: string,
        answeredBy: string,
        offer: any,
        answer: any,
        iceState: number,
        state: number,
    },
};

export default class WebRTCController extends BaseController {
    async polling() {
        const store = global.storage;
        const { room, user } = this.ctx.query;

        if (!store[room]) {
            store[room] = {
                state: STATES.new,
            };
        }

        const currentRoom = store[room];

        if (currentRoom) {
            if (!currentRoom.participants) {
                currentRoom.participants = new Set([user]);
            } else {
                currentRoom.participants.add(user);
            }
        }

        const response: any = {
            state: currentRoom.state,
        };

        switch (currentRoom.state) {
            case STATES.new: {
                break;
            }
            case STATES.offered: {
                if (currentRoom.offeredBy !== user) {
                    response.offeredBy = currentRoom.offeredBy;
                    response.offer = currentRoom.offer;

                    delete currentRoom.offer;
                }

                break;
            }
            case STATES.answered: {
                if (currentRoom.answeredBy !== user) {
                    response.answeredBy = currentRoom.answeredBy;
                    response.answer = currentRoom.answer;

                    delete currentRoom.answer;
                }

                break;
            }
            case STATES.icing: {
                break;
            }
            case STATES.connected: {
                break;
            }
        }

        return response;
    }

    reset() {
        const store = global.storage;
        const { room } = this.ctx.query;

        console.log(`room ${room} reset`);

        store[room] = {
            state: STATES.new,
        };

        return;
    }

    exchangeDescription() {
        const store = global.storage;
        const { room, user } = this.ctx.query;
        const { offer, answer } = this.ctx.request.body;

        console.log(room, user, offer, answer);

        const currentRoom = store[room];

        if (currentRoom.state === STATES.new && offer) {
            currentRoom.offeredBy = user;
            currentRoom.offer = offer;
            currentRoom.state = STATES.offered;

            return;
        }

        if (currentRoom.state === STATES.offered && answer) {
            currentRoom.answeredBy = user;
            currentRoom.answer = answer;
            currentRoom.state = STATES.answered;
        }
    }
}
