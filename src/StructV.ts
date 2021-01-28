import { Engine } from "./engine";






export const SV = {

    
    createEngine(engineName: string): Engine {
        return new Engine(engineName);
    },

    

};

