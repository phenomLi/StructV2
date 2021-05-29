

export interface EventBusInterface {
    events: { [key: string]: Function[] };
    on(eventName: string, callback: Function): void;
    emit(eventName: string, payload?: any): void;
}


export const EventBus: EventBusInterface = {
    events: { },

    /**
     * 绑定事件
     * @param eventName 
     * @param callback 
     */
    on(eventName: string, callback: Function) {
        if(EventBus.events[eventName] === undefined) {
            EventBus.events[eventName] = [];
        }

        EventBus.events[eventName].push(callback);
    },

    /**
     * 
     * @param eventName 
     * @param payload 
     */
    emit(eventName: string, payload?: any) {
        if(EventBus.events[eventName] === undefined) {
            return;
        }

        EventBus.events[eventName].map(item => item(payload));
    }
};