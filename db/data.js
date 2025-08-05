// Staff definition
/**
 * @typedef {Object} Staff
 * @property {string} name
 * @property {string} nationalId
 * @property {number} costPerHour
 */


/**
 * @type {Staff[]}
 * */
export const staff = []

// Materials definition
/**
 * @typedef {Object} Material
 * @property {string} name
 * @property {number} cost
 */

/**
 * @type {Material[]}
 */
export const materials = []

// Extra costs definition
/**
 * @typedef {Object} ExtraCost
 * @property {number} quantity
 * @property {number} cost
 */

/**
 * @type {ExtraCost[]}
 */
export const extraCosts = []

// Tasks definition
/**
 * @typedef {Object} Task
 * @property {string} name
 * @property {number} hours
 * @property {Staff} staff
 * @property {Material[]} materials
 * @property {ExtraCost[]} extraCosts
 * @property {boolean} completed
 * @property {number} estimatedCost
 */

/**
 * @type {Task[]}
 */
export const tasks = []
