declare namespace NodeJS {
    interface Global {
        storage: {
            [prop: string]: any,
        };
    }
}
