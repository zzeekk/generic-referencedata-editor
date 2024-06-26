/**
 * Function to transform a value by a function if it is defined, and otherwise returns a default value.
 */
export function transformOrDefault<In,Out>(input: In, f: (In) => Out, defaultVal: Out) {
    return (input ? f(input) : defaultVal);
}

export function withDefault<Type>(input: Type, defaultVal: Type) {
    return (input ? input : defaultVal);
}

/**
 * Access property by path, e.g "a.b.c", also supports array indexes, e.g. "a[0].b.c"
 * see also https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path
 */
export function getPropertyByPath(object: any, path: string) {
  return path
   .split(/[.[\]'"]/)
   .filter(k => k)
   .reduce((o, k) => o ? o[k] : undefined, object);
}

/**
 * Filter function to make array unique
 * usage: arr.filter(onlyUnique);
 */
export function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

/**
 * Create function to compare attribute of two objects.
 * This can be used for sorting arrays.
 * usage: arr.sort(compareFunc("x"))
 */
export function compareFunc(attr: any) {
  return (a, b) => {
    if (a[attr] === b[attr]) return 0;
    else return a[attr] > b[attr] || a[attr] === undefined ? 1 : -1;
  }
}

/**
 * Create function to compare attributes of two objects.
 * This can be used for sorting arrays with multiple sort attributes.
 * usage: arr.sort(compareFunc(["x","y"]))
 */
export function compareMultiFunc(attrs: any[]) {
  function compare(a: any,b: any, attrIdx: number) {
    const aVal = getPropertyByPath(a, attrs[attrIdx]); 
    const bVal = getPropertyByPath(b, attrs[attrIdx]); 
    if (aVal === bVal) {
      if (attrIdx === attrs.length-1) return 0; // final attr to compare?
      else return compare(a,b,attrIdx + 1); // otherwise continue with next attr
    } else return aVal > bVal || aVal === undefined ? 1 : -1;
  }
  return (a, b) => compare(a,b,0);
}

/**
 * Dynamically remove an attribute from an object
 * without changing the original object (deep clone)
 */
export function removeAttr(obj: object, attrs: string[]): object {
  let objClone = {...obj}; // deep clone to avoid mutation of the original data
  attrs.forEach(a => delete objClone[a]);
  return objClone;
}

/**
 * Format number of bytes human friendly
 */
export function formatFileSize(size: number){
  var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
 }
 
 /**
  * Capitalize first letter of a string
  */
 export function capitalize(str: string){
  return str.charAt(0).toUpperCase() + str.slice(1);
 }

  /**
  * Camel case to title case, e.g. helloWorld -> Hello World
  */
  export function camelToTitleCase(str: string){
    if (str.length == 0) return str;
    var str1 = str.replace(/([A-Z])/g, (match) => ` ${match}`);
    return str1.charAt(0).toUpperCase() + str1.slice(1);
  }

  /**
   * Check if value is a number
   */
  export function isNumber(value) {
    return typeof value === 'number';
  }

  /**
   * Check if value is an array
   */
  export function isArray(value) {
    return typeof value == 'object' && Array.isArray(value);
  }

  /**
   * Check if value is an object
   */
  export function isObject(value) {
    return typeof value == 'object' && !Array.isArray(value);
  }  

  /**
   * Deep clone (copy) of object
   */
  export function deepClone<T>(a: T): T {
    if (!a) return a;
    return JSON.parse(JSON.stringify(a));
  }