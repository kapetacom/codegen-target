import {DATATYPE_CONFIGURATION, DSLData, DSLEntityType, DSLParser} from "@kapeta/kaplang-core";


export function parseEntities(code:string): DSLData[] {
    const parsedEntities = DSLParser.parse(code, {...DATATYPE_CONFIGURATION, ignoreSemantics: true});

    if (parsedEntities?.entities) {
        return parsedEntities.entities.filter(
            (e) => e.type === DSLEntityType.DATATYPE || e.type === DSLEntityType.ENUM
        ) as DSLData[];
    }

    return [];
}