/**
 * Works like the python zip function, but for only two arguments
 * 
 * @param a the first array
 * @param b the second array
 * @returns an array of tuples of the corresponding elements in a and b
 */
export function zip<T, U>(a: Array<T>, b: Array<U>): Array<[T, U]> {
    if (a.length <= b.length)
        return a.map((element, index) => [element, b[index]]);
    else
        return b.map((element, index) => [a[index], element]);
}