import type { Plugin as PrettyFormatPlugin } from 'pretty-format'
import type { MatchersObject } from '@vitest/expect'
import type { SnapshotState } from '@vitest/snapshot'
import type { MatcherState } from './chai'
import type { Constructable, UserConsoleLog } from './general'
import type { VitestEnvironment } from './config'
import type { BenchmarkResult } from './benchmark'

type Promisify<O> = {
  [K in keyof O]: O[K] extends (...args: infer A) => infer R
    ? O extends R
      ? Promisify<O[K]>
      : (...args: A) => Promise<R>
    : O[K]
}

declare module '@vitest/expect' {
  interface MatcherState {
    environment: VitestEnvironment
    snapshotState: SnapshotState
  }
}

declare module '@vitest/runner' {
  interface TestContext {
    expect: Vi.ExpectStatic
  }

  interface File {
    prepareDuration?: number
    environmentLoad?: number
  }

  interface TaskBase {
    logs?: UserConsoleLog[]
  }

  interface TaskResult {
    benchmark?: BenchmarkResult
  }
}

declare global {
  // support augmenting jest.Matchers by other libraries
  namespace jest {

    interface Matchers<_R, _T = {}> {}
  }

  namespace Vi {
    interface ExpectStatic extends Chai.ExpectStatic, AsymmetricMatchersContaining {
      <T>(actual: T, message?: string): Vi.Assertion<T>

      extend(expects: MatchersObject): void
      assertions(expected: number): void
      hasAssertions(): void
      anything(): any
      any<T>(constructor: new() => T): T;
      addSnapshotSerializer(plugin: PrettyFormatPlugin): void
      getState(): MatcherState
      setState(state: Partial<MatcherState>): void
      not: AsymmetricMatchersContaining
    }

    interface AsymmetricMatchersContaining {
      stringContaining(expected: string): any
      objectContaining<T = any>(expected: T): any
      arrayContaining<T = unknown>(expected: Array<T>): any
      stringMatching(expected: string | RegExp): any
    }

    interface JestAssertion<T = any> extends jest.Matchers<void, T> {
      // Snapshot
      matchSnapshot<U extends { [P in keyof T]: any }>(snapshot: Partial<U>, message?: string): void
      matchSnapshot(message?: string): void
      toMatchSnapshot<U extends { [P in keyof T]: any }>(snapshot: Partial<U>, message?: string): void
      toMatchSnapshot(message?: string): void
      toMatchInlineSnapshot<U extends { [P in keyof T]: any }>(properties: Partial<U>, snapshot?: string, message?: string): void
      toMatchInlineSnapshot(snapshot?: string, message?: string): void
      toMatchFileSnapshot(filepath: string, message?: string): Promise<void>
      toThrowErrorMatchingSnapshot(message?: string): void
      toThrowErrorMatchingInlineSnapshot(snapshot?: string, message?: string): void

      // Jest compact
      toEqual<E>(expected: E): void
      toStrictEqual<E>(expected: E): void
      toBe<E>(expected: E): void
      toMatch(expected: string | RegExp): void
      toMatchObject<E extends {} | any[]>(expected: E): void
      toContain<E>(item: E): void
      toContainEqual<E>(item: E): void
      toBeTruthy(): void
      toBeFalsy(): void
      toBeGreaterThan(num: number | bigint): void
      toBeGreaterThanOrEqual(num: number | bigint): void
      toBeLessThan(num: number | bigint): void
      toBeLessThanOrEqual(num: number | bigint): void
      toBeNaN(): void
      toBeUndefined(): void
      toBeNull(): void
      toBeDefined(): void
      toBeTypeOf(expected: 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined'): void
      toBeInstanceOf<E>(expected: E): void
      toBeCalledTimes(times: number): void
      toHaveLength(length: number): void
      toHaveProperty<E>(property: string | (string | number)[], value?: E): void
      toBeCloseTo(number: number, numDigits?: number): void
      toHaveBeenCalledTimes(times: number): void
      toHaveBeenCalledOnce(): void
      toHaveBeenCalled(): void
      toBeCalled(): void
      toHaveBeenCalledWith<E extends any[]>(...args: E): void
      toBeCalledWith<E extends any[]>(...args: E): void
      toHaveBeenNthCalledWith<E extends any[]>(n: number, ...args: E): void
      nthCalledWith<E extends any[]>(nthCall: number, ...args: E): void
      toHaveBeenLastCalledWith<E extends any[]>(...args: E): void
      lastCalledWith<E extends any[]>(...args: E): void
      toThrow(expected?: string | Constructable | RegExp | Error): void
      toThrowError(expected?: string | Constructable | RegExp | Error): void
      toReturn(): void
      toHaveReturned(): void
      toReturnTimes(times: number): void
      toHaveReturnedTimes(times: number): void
      toReturnWith<E>(value: E): void
      toHaveReturnedWith<E>(value: E): void
      toHaveLastReturnedWith<E>(value: E): void
      lastReturnedWith<E>(value: E): void
      toHaveNthReturnedWith<E>(nthCall: number, value: E): void
      nthReturnedWith<E>(nthCall: number, value: E): void
      toSatisfy<E>(matcher: (value: E) => boolean, message?: string): void
    }

    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore build namespace conflict
    type VitestAssertion<A, T> = {
      [K in keyof A]: A[K] extends Chai.Assertion
        ? Assertion<T>
        : A[K] extends (...args: any[]) => any
          ? A[K] // not converting function since they may contain overload
          : VitestAssertion<A[K], T>
    } & ((type: string, message?: string) => Assertion)

    interface Assertion<T = any> extends VitestAssertion<Chai.Assertion, T>, JestAssertion<T> {
      resolves: Promisify<Assertion<T>>
      rejects: Promisify<Assertion<T>>
    }
  }
}

export {}
