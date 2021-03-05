// Onject.values does not provide correct return type for enums
const getEnumValues = <E extends {}, O = E[keyof E]>(enumObj: E, callback?: (a: E[keyof E]) => O): O[] => Object.keys(enumObj)
    .reduce<O[]>((all, current) => {
        // We only care about the names, not the indexes
        if (isNaN(current as any)) {
            all.push(callback ? callback(enumObj[current]) : enumObj[current]);
        }
        return all;
    }, []);

export default getEnumValues;
