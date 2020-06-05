const STATES = {
    preparing: 0,
    connecting: 1,
    connected: 2,
    closing: 3,
    closed: 4
};

export default class PersistentConnection {
    constructor(endpoint, options = {}) {
        this.endpoint = endpoint;
        this.state = STATES.preparing;
        this.desctructOptions(options);
    }

    dump() {
        console.log(this.minInterval);
    }

    async poll(executor, options) {
        if (this.state === STATES.preparing) {
            this.state = STATES.connecting;
        }

        const startTime = Date.now();

        try {
            const response = await fetch(this.endpoint, options);

            if (this.state === STATES.connecting) {
                this.state = STATES.connected;
            }

            const body = await response.json();

            await executor(body);
        } catch (e) {
            console.log(e);
        }

        const endTime = Date.now();

        if (this.state === STATES.connected) {
            setTimeout(() => {
                this.poll(executor, options);
            }, this.minInterval - endTime + startTime);
        }
    }

    close() {
        this.state = STATES.closed;
    }

    desctructOptions(options) {
        ({
            minInterval: this.minInterval
        } = options);
    }
}
