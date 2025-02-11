/**
 * 将 T 类型中的 K 属性变为可选属性
 */
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;



