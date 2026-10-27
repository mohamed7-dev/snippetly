/**
 * @description
 * Filter unique values from the given array.
 *
 * :::info
 * If byKey argument is specified only the matching properties will be used to check duplicates.
 * Objects are compared by reference.
 * :::
 */
export function filterUnique<Input>(inputArr: Input[], byKey?: keyof Input): Input[] {
    if (!byKey) {
        return Array.from(new Set(inputArr));
    } else {
        // Based on https://stackoverflow.com/a/58429784/772859
        return [...new Map(inputArr.map(item => [item[byKey], item])).values()];
    }
}
